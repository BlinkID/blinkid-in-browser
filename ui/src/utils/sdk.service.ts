import * as BlinkIDSDK from "../../../es/blinkid-sdk";

import {
  AvailableRecognizers,
  AvailableRecognizerOptions,
  CameraExperience,
  Code,
  EventFatalError,
  EventReady,
  VideoRecognitionConfiguration,
  ImageRecognitionConfiguration,
  RecognizerInstance,
  RecognitionEvent,
  RecognitionStatus,
  RecognitionResults,
  SdkSettings
} from './data-structures';

export interface CheckConclusion {
  status: boolean;
  message?: string;
}

export class SdkService {
  private sdk: BlinkIDSDK.WasmSDK;

  private eventEmitter$: HTMLAnchorElement;

  private cancelInitiatedFromOutside: boolean = false;

  public showOverlay: boolean = false;

  constructor() {
    this.eventEmitter$ = document.createElement('a');
  }

  public initialize(licenseKey: string, sdkSettings: SdkSettings): Promise<EventReady|EventFatalError> {
    const loadSettings = new BlinkIDSDK.WasmSDKLoadSettings(licenseKey);

    loadSettings.allowHelloMessage = sdkSettings.allowHelloMessage;
    loadSettings.engineLocation = sdkSettings.engineLocation;

    return new Promise((resolve) => {
      BlinkIDSDK.loadWasmModule(loadSettings)
        .then((sdk: BlinkIDSDK.WasmSDK) => {
          this.sdk = sdk;
          this.showOverlay = sdk.showOverlay;
          resolve(new EventReady(this.sdk));
        })
        .catch(error => {
          resolve(new EventFatalError(Code.SdkLoadFailed, 'Failed to load SDK!', error));
        });
    });
  }

  public checkRecognizers(recognizers: Array<string>): CheckConclusion {
    if (!recognizers || !recognizers.length) {
      return {
        status: false,
        message: 'There are no provided recognizers!'
      }
    }

    for (const recognizer of recognizers) {
      if (!this.isRecognizerAvailable(recognizer)) {
        return {
          status: false,
          message: `Recognizer "${ recognizer }" doesn't exist!`
        }
      }
      if (recognizer === 'BlinkIdCombinedRecognizer' && recognizers.length > 1) {
        return {
          status: false,
          message: 'Recognizer "BlinkIdCombinedRecognizer" cannot be used in combination with other recognizers!'
        };
      }
    }

    return {
      status: true
    }
  }

  public checkRecognizerOptions(recognizers: Array<string>, recognizerOptions: Array<string>): CheckConclusion {
    if (!recognizerOptions || !recognizerOptions.length) {
      return {
        status: true
      }
    }

    for (const recognizerOption of recognizerOptions) {
      let optionExistInProvidedRecognizers = false;

      for (const recognizer of recognizers) {
        const availableOptions = AvailableRecognizerOptions[recognizer];

        if (availableOptions.indexOf(recognizerOption) > -1) {
          optionExistInProvidedRecognizers = true;
          break;
        }
      }

      if (!optionExistInProvidedRecognizers) {
        return {
          status: false,
          message: `Recognizer option "${ recognizerOption }" is not supported by available recognizers!`
        }
      }
    }

    return {
      status: true
    }
  }

  public getDesiredCameraExperience(recognizers: Array<string>): CameraExperience {
    if (recognizers.indexOf('BlinkIdCombinedRecognizer') > -1) {
      return CameraExperience.CardCombined;
    }

    if (recognizers.indexOf('BlinkIdRecognizer') > -1) {
      return CameraExperience.CardSingleSide;
    }

    return CameraExperience.Barcode;
  }

  public async scanFromCamera(
    configuration: VideoRecognitionConfiguration,
    eventCallback: (ev: RecognitionEvent) => void
  ): Promise<void> {
    eventCallback({ status: RecognitionStatus.Preparing });

    const recognizers = await this.createRecognizers(
      configuration.recognizers,
      configuration.recognizerOptions,
      configuration.successFrame
    );

    const recognizerRunner = await this.createRecognizerRunner(
      recognizers,
      eventCallback
    );

    try {
      const videoRecognizer = await BlinkIDSDK.VideoRecognizer.createVideoRecognizerFromCameraStream(
        configuration.cameraFeed,
        recognizerRunner
      );

      await videoRecognizer.setVideoRecognitionMode(BlinkIDSDK.VideoRecognitionMode.Recognition);

      this.eventEmitter$.addEventListener('terminate', async () => {
        if (videoRecognizer && typeof videoRecognizer.cancelRecognition === 'function') {
          videoRecognizer.cancelRecognition();
        }

        if (recognizerRunner) {
            try {
              await recognizerRunner.delete();
            } catch (error) {
              // Psst, this error should not happen.
            }
        }

        for (const recognizer of recognizers) {
          if (!recognizer) {
            continue;
          }

          if (
            recognizer.recognizer &&
            recognizer.recognizer.objectHandle > -1 &&
            typeof recognizer.recognizer.delete === 'function'
          ) {
            recognizer.recognizer.delete()
          }

          if (
            recognizer.successFrame &&
            recognizer.successFrame.objectHandle > -1
            && typeof recognizer.successFrame.delete === 'function'
          ) {
            recognizer.successFrame.delete();
          }
        }

        window.setTimeout(() => {
          if (videoRecognizer) {
            videoRecognizer.releaseVideoFeed();
          }
        }, 1);
      });

      videoRecognizer.startRecognition(
        async (recognitionState: BlinkIDSDK.RecognizerResultState) => {
          videoRecognizer.pauseRecognition();

          eventCallback({ status: RecognitionStatus.Processing });

          if (recognitionState !== BlinkIDSDK.RecognizerResultState.Empty) {
            for (const recognizer of recognizers) {
              const results = await recognizer.recognizer.getResult();

              if (!results || results.state === BlinkIDSDK.RecognizerResultState.Empty) {
                eventCallback({
                  status: RecognitionStatus.EmptyResultState,
                  data: { initiatedByUser: this.cancelInitiatedFromOutside }
                });
              } else {
                const recognitionResults: RecognitionResults = { recognizer: results }

                if (recognizer.successFrame) {
                  const successFrameResults = await recognizer.successFrame.getResult();

                  if (successFrameResults && successFrameResults.state !== BlinkIDSDK.RecognizerResultState.Empty) {
                    recognitionResults.successFrame = successFrameResults;
                  }
                }

                eventCallback({
                  status: RecognitionStatus.ScanSuccessful,
                  data: recognitionResults
                });
                break;
              }
            }
          } else {
            eventCallback({
              status: RecognitionStatus.EmptyResultState,
              data: { initiatedByUser: this.cancelInitiatedFromOutside }
            });
          }

          window.setTimeout(() => void this.cancelRecognition(), 400);
        }
      );
    } catch (error) {
      if (error && error.name === 'VideoRecognizerError') {
        const reason = (error as BlinkIDSDK.VideoRecognizerError).reason;

        switch (reason) {
          case BlinkIDSDK.NotSupportedReason.MediaDevicesNotSupported:
            eventCallback({ status: RecognitionStatus.NoSupportForMediaDevices });
            break;

          case BlinkIDSDK.NotSupportedReason.CameraNotFound:
            eventCallback({ status: RecognitionStatus.CameraNotFound });
            break;

          case BlinkIDSDK.NotSupportedReason.CameraNotAllowed:
            eventCallback({ status: RecognitionStatus.CameraNotAllowed });
            break;

          case BlinkIDSDK.NotSupportedReason.CameraInUse:
            eventCallback({ status: RecognitionStatus.CameraInUse });
            break;

          default:
            eventCallback({ status: RecognitionStatus.UnableToAccessCamera });
        }

        console.warn('VideoRecognizerError', error.name, '[' + reason + ']:', error.message);
        void this.cancelRecognition();
      } else {
        eventCallback({ status: RecognitionStatus.UnknownError });
      }
    }
  }

  public isScanFromImageAvailable(recognizers: Array<string>): boolean {
    return recognizers.indexOf('BlinkIdCombinedRecognizer') === -1;
  }

  public async scanFromImage(
    configuration: ImageRecognitionConfiguration,
    eventCallback: (ev: RecognitionEvent) => void
  ): Promise<void> {
    eventCallback({ status: RecognitionStatus.Preparing });

    const recognizers = await this.createRecognizers(
      configuration.recognizers,
      configuration.recognizerOptions
    );

    const recognizerRunner = await this.createRecognizerRunner(
      recognizers,
      eventCallback
    );

    // Get image file
    const imageRegex = RegExp(/^image\//);
    const file: File|null = (() => {
      for (let i = 0; i < configuration.fileList.length; ++i) {
        if (imageRegex.exec(configuration.fileList[i].type)) {
          return configuration.fileList[i];
        }
      }

      return null;
    })();

    if (!file) {
      eventCallback({ status: RecognitionStatus.NoImageFileFound });
      return;
    }

    const imageElement = document.createElement('img');
    imageElement.src = URL.createObjectURL(file);
    await imageElement.decode();
    const imageFrame = BlinkIDSDK.captureFrame(imageElement);

    this.eventEmitter$.addEventListener('terminate', async () => {
      if (recognizerRunner) {
          try {
            await recognizerRunner.delete();
          } catch (error) {
            // Psst, this error should not happen.
          }
      }

      for (const recognizer of recognizers) {
        if (!recognizer) {
          continue;
        }

        if (
          recognizer.recognizer &&
          recognizer.recognizer.objectHandle > -1 &&
          typeof recognizer.recognizer.delete === 'function'
        ) {
          await recognizer.recognizer.delete();
        }
      }
    });

    // Get results
    eventCallback({ status: RecognitionStatus.Processing });

    const processResult = await recognizerRunner.processImage(imageFrame);

    if (processResult !== BlinkIDSDK.RecognizerResultState.Empty) {
      for (const recognizer of recognizers) {
        const results = await recognizer.recognizer.getResult();

        if (!results || results.state === BlinkIDSDK.RecognizerResultState.Empty) {
          eventCallback({
            status: RecognitionStatus.EmptyResultState,
            data: { initiatedByUser: this.cancelInitiatedFromOutside }
          });
        } else {
          const recognitionResults: RecognitionResults = { recognizer: results }
          eventCallback({
            status: RecognitionStatus.ScanSuccessful,
            data: recognitionResults
          });
          break;
        }
      }
    } else {
      eventCallback({
        status: RecognitionStatus.EmptyResultState,
        data: { initiatedByUser: this.cancelInitiatedFromOutside }
      });
    }

    window.setTimeout(() => void this.cancelRecognition(), 500);
  }

  public async stopRecognition() {
    void await this.cancelRecognition(true);
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  // PRIVATE METHODS

  private isRecognizerAvailable(recognizer: string): boolean {
    return !!AvailableRecognizers[recognizer];
  }

  private async createRecognizers(
    recognizers: Array<string>,
    recognizerOptions?: Array<string>,
    successFrame: boolean = false
  ): Promise<Array<RecognizerInstance>> {
    const pureRecognizers = [];

    for (const recognizer of recognizers) {
      const instance = await BlinkIDSDK[AvailableRecognizers[recognizer]](this.sdk);
      pureRecognizers.push(instance);
    }

    if (recognizerOptions && recognizerOptions.length) {
      for (const recognizer of pureRecognizers) {
        let settingsUpdated = false;
        const settings = await recognizer.currentSettings();

        for (const setting of recognizerOptions) {
          if (setting in settings) {
            settings[setting] = true;
            settingsUpdated = true;
          }
        }

        if (settingsUpdated) {
          await recognizer.updateSettings(settings);
        }
      }
    }

    const recognizerInstances = [];

    for (const recognizer of pureRecognizers) {
      const instance: RecognizerInstance = { recognizer }

      if (successFrame) {
        const successFrameGrabber = await BlinkIDSDK.createSuccessFrameGrabberRecognizer(this.sdk, recognizer);
        instance.successFrame = successFrameGrabber;
      }

      recognizerInstances.push(instance)
    }

    return recognizerInstances;
  }

  private async createRecognizerRunner(
    recognizers: Array<RecognizerInstance>,
    eventCallback: (ev: RecognitionEvent) => void
  ): Promise<BlinkIDSDK.RecognizerRunner> {
    const metadataCallbacks: BlinkIDSDK.MetadataCallbacks = {
      onDetectionFailed: () => eventCallback({ status: RecognitionStatus.DetectionFailed }),
      onQuadDetection: (quad: BlinkIDSDK.Displayable) => {
        eventCallback({ status: RecognitionStatus.DetectionStatusChange, data: quad });

        const detectionStatus = quad.detectionStatus;

        switch (detectionStatus) {
          case BlinkIDSDK.DetectionStatus.Fail:
            eventCallback({ status: RecognitionStatus.DetectionStatusSuccess });
            break;

          case BlinkIDSDK.DetectionStatus.Success:
            eventCallback({ status: RecognitionStatus.DetectionStatusSuccess });
            break;

          case BlinkIDSDK.DetectionStatus.CameraTooHigh:
            eventCallback({ status: RecognitionStatus.DetectionStatusCameraTooHigh });
            break;

          case BlinkIDSDK.DetectionStatus.FallbackSuccess:
            eventCallback({ status: RecognitionStatus.DetectionStatusFallbackSuccess });
            break;

          case BlinkIDSDK.DetectionStatus.Partial:
            eventCallback({ status: RecognitionStatus.DetectionStatusPartial });
            break;

          case BlinkIDSDK.DetectionStatus.CameraAtAngle:
            eventCallback({ status: RecognitionStatus.DetectionStatusCameraAtAngle });
            break;

          case BlinkIDSDK.DetectionStatus.CameraTooNear:
            eventCallback({ status: RecognitionStatus.DetectionStatusCameraTooNear });
            break;

          case BlinkIDSDK.DetectionStatus.DocumentTooCloseToEdge:
            eventCallback({ status: RecognitionStatus.DetectionStatusDocumentTooCloseToEdge });
            break;

          default:
            // Send nothing
        }
      }
    }
    const blinkIdGeneric = recognizers.find(el => el.recognizer.recognizerName === 'BlinkIdRecognizer');
    const blinkIdCombined = recognizers.find(el => el.recognizer.recognizerName === 'BlinkIdCombinedRecognizer');

    if (blinkIdGeneric || blinkIdCombined) {
      for (const el of recognizers) {
        if (
          el.recognizer.recognizerName === 'BlinkIdRecognizer' ||
          el.recognizer.recognizerName === 'BlinkIdCombinedRecognizer'
        ) {
          const settings = await el.recognizer.currentSettings() as BlinkIDSDK.BlinkIdRecognizerSettings;
          settings.classifierCallback = (supported: boolean) => {
            eventCallback({ status: RecognitionStatus.DocumentClassified, data: supported });
          }
          await el.recognizer.updateSettings(settings);
        }
      }
    }

    if (blinkIdCombined) {
      metadataCallbacks.onFirstSideResult = () => eventCallback({ status: RecognitionStatus.OnFirstSideResult });
    }
    const recognizerRunner = await BlinkIDSDK.createRecognizerRunner(
      this.sdk,
      recognizers.map((el: RecognizerInstance) => el.successFrame || el.recognizer),
      false,
      metadataCallbacks
    );

    return recognizerRunner;
  }

  private async cancelRecognition(initiatedFromOutside: boolean = false): Promise<void> {
    this.cancelInitiatedFromOutside = initiatedFromOutside;
    this.eventEmitter$.dispatchEvent(new Event('terminate'));
  }
}

