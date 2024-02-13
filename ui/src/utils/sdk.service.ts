/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import * as BlinkIDSDK from '@microblink/blinkid-in-browser-sdk';

import {
  AvailableRecognizers,
  CameraEntry,
  CameraExperience,
  EventReady,
  VideoRecognitionConfiguration,
  ImageRecognitionConfiguration,
  MultiSideImageRecognitionConfiguration,
  ImageRecognitionType,
  RecognizerInstance,
  RecognitionEvent,
  RecognitionStatus,
  RecognitionResults,
  SdkSettings,
  SDKError
} from './data-structures';
import * as ErrorTypes from './error-structures';

const _IS_IMAGE_CAPTURE = false;

export interface CheckConclusion {
  status: boolean;
  message?: string;
}

export async function getCameraDevices(): Promise<Array<CameraEntry>> {
  const devices = await BlinkIDSDK.getCameraDevices();
  const allDevices = devices.frontCameras.concat(devices.backCameras);
  const finalEntries = allDevices.map((el: BlinkIDSDK.SelectedCamera) => {
    return {
      prettyName: el.label,
      details: el
    }
  });

  return finalEntries;
}

export class SdkService {
  private sdk: BlinkIDSDK.WasmSDK;

  private eventEmitter$: HTMLAnchorElement;

  private cancelInitiatedFromOutside: boolean = false;

  private recognizerName: string;

  public videoRecognizer: BlinkIDSDK.VideoRecognizer;

  public showOverlay: boolean = false;

  constructor() {
    this.eventEmitter$ = document.createElement('a');
  }

  public delete() {
    this.sdk?.delete();
  }

  public initialize(licenseKey: string, sdkSettings: SdkSettings): Promise<EventReady|SDKError> {
    const loadSettings = new BlinkIDSDK.WasmSDKLoadSettings(licenseKey);

    loadSettings.allowHelloMessage = sdkSettings.allowHelloMessage;
    loadSettings.engineLocation = sdkSettings.engineLocation;
    loadSettings.workerLocation = sdkSettings.workerLocation;

    if (sdkSettings.wasmType) {
      loadSettings.wasmType = sdkSettings.wasmType;
    }

    if (sdkSettings.wasmFlavor) {
      loadSettings.wasmFlavor = sdkSettings.wasmFlavor;
    }

    return new Promise((resolve) => {
      BlinkIDSDK.loadWasmModule(loadSettings)
        .then((sdk: BlinkIDSDK.WasmSDK) => {
          this.sdk = sdk;
          this.showOverlay = sdk.showOverlay;
          resolve(new EventReady(this.sdk));
        })
        .catch(error => {
          resolve(new SDKError(ErrorTypes.componentErrors.sdkLoadFailed, error));
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

      if (recognizer === 'BlinkIdMultiSideRecognizer' && recognizers.length > 1) {
        return {
          status: false,
          message: 'Recognizer "BlinkIdMultiSideRecognizer" cannot be used in combination with other recognizers!'
        };
      }
    }

    return {
      status: true
    }
  }

  public getDesiredCameraExperience(_recognizers: Array<string> = [], _recognizerOptions: any = {}): CameraExperience {
    if (_recognizers.indexOf('BlinkIdMultiSideRecognizer') > -1) {
      return CameraExperience.CardMultiSide;
    }

    if (_recognizers.indexOf('BlinkIdSingleSideRecognizer') > -1) {
      return CameraExperience.CardSingleSide;
    }

    return CameraExperience.Barcode;
  }

  public async scanFromCamera(
    configuration: VideoRecognitionConfiguration,
    eventCallback: (ev: RecognitionEvent) => void
  ): Promise<void> {
    eventCallback({ status: RecognitionStatus.Preparing });

    this.cancelInitiatedFromOutside = false;

    // Prepare terminate mechanism before recognizer and runner instances are created
    this.eventEmitter$.addEventListener('terminate', async () => {
      this.videoRecognizer?.cancelRecognition?.();
      window.setTimeout(() => this.videoRecognizer?.releaseVideoFeed?.(), 1);

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

        if (recognizer.recognizer?.objectHandle > -1) {
          recognizer.recognizer.delete?.();
        }

      }
    });

    // Prepare recognizers and runner
    const recognizers = await this.createRecognizers(
      configuration.recognizers,
      configuration.recognizerOptions,
    );

    const recognizerRunner = await this.createRecognizerRunner(
      recognizers,
      eventCallback
    );

    try {
      this.videoRecognizer = await BlinkIDSDK.VideoRecognizer.createVideoRecognizerFromCameraStream(
        configuration.cameraFeed,
        recognizerRunner,
        configuration.cameraId
      );

      eventCallback({ status: RecognitionStatus.Ready });

      await this.videoRecognizer.setVideoRecognitionMode(BlinkIDSDK.VideoRecognitionMode.Recognition);

      await this.videoRecognizer.startRecognition(
        async (recognitionState: BlinkIDSDK.RecognizerResultState) => {
          this.videoRecognizer.pauseRecognition();

          eventCallback({ status: RecognitionStatus.Processing });

          if (recognitionState !== BlinkIDSDK.RecognizerResultState.Empty) {
            for (const recognizer of recognizers) {
              const results = await recognizer.recognizer.getResult();
              this.recognizerName = recognizer.recognizer.recognizerName;

              if (!results || results.state === BlinkIDSDK.RecognizerResultState.Empty) {
                eventCallback({
                  status: RecognitionStatus.EmptyResultState,
                  data: {
                    initiatedByUser: this.cancelInitiatedFromOutside,
                    recognizerName: this.recognizerName
                  }
                });
              } else {
                const recognitionResults: RecognitionResults = {
                  recognizer: results,
                  recognizerName: this.recognizerName
                }


                recognitionResults.imageCapture = _IS_IMAGE_CAPTURE;

                if (configuration.recognizerOptions?.returnSignedJSON) {
                  recognitionResults.resultSignedJSON = await recognizer.recognizer.toSignedJSON();
                }

                const scanData: any = {
                  result: recognitionResults,
                  initiatedByUser: this.cancelInitiatedFromOutside,
                  imageCapture: _IS_IMAGE_CAPTURE
                }

                eventCallback({
                  status: RecognitionStatus.ScanSuccessful,
                  data: scanData
                });
                break;
              }
            }
          } else {
            eventCallback({
              status: RecognitionStatus.EmptyResultState,
              data: {
                initiatedByUser: this.cancelInitiatedFromOutside,
                recognizerName: ''
              }
            });
          }

          window.setTimeout(() => void this.cancelRecognition(), 400);
        }, configuration.recognitionTimeout)
        .then(() => { /* Scanning... */ })
        .catch((error) => { throw error; });
;
    } catch (error) {
      if (!error.code) {
        eventCallback({ status: RecognitionStatus.UnknownError });
      } else {
        switch (error.code) {
          case BlinkIDSDK.ErrorCodes.VIDEO_RECOGNIZER_MEDIA_DEVICES_UNSUPPORTED:
            eventCallback({ status: RecognitionStatus.NoSupportForMediaDevices });
            break;
          case BlinkIDSDK.ErrorCodes.VIDEO_RECOGNIZER_CAMERA_MISSING:
            eventCallback({ status: RecognitionStatus.CameraNotFound });
            break;
          case BlinkIDSDK.ErrorCodes.VIDEO_RECOGNIZER_CAMERA_NOT_ALLOWED:
            eventCallback({ status: RecognitionStatus.CameraNotAllowed });
            break;
          case BlinkIDSDK.ErrorCodes.VIDEO_RECOGNIZER_CAMERA_IN_USE:
            eventCallback({ status: RecognitionStatus.CameraInUse });
            break;

          default:
            eventCallback({ status: RecognitionStatus.UnableToAccessCamera });
            break;
        }
      }

      console.warn('Error in VideoRecognizer', error.code, error.message);

      void this.cancelRecognition();
    }
  }

  public async flipCamera(): Promise<void> {
    await this.videoRecognizer.flipCamera();
  }

  public isCameraFlipped(): boolean {
    if (!this.videoRecognizer) {
      return false;
    }
    return this.videoRecognizer.isCameraFlipped();
  }

  public isScanFromImageAvailable(_recognizers: Array<string> = [], _recognizerOptions: any = {}): boolean {
    return true;
  }

  public getScanFromImageType(_recognizers: Array<string> = [], _recognizerOptions: any = {}): ImageRecognitionType {
    if (_recognizers.indexOf('BlinkIdMultiSideRecognizer') > -1) {
      return ImageRecognitionType.MultiSide;
    }

    return ImageRecognitionType.SingleSide;
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

    const handleTerminate = async () => {
      this.eventEmitter$.removeEventListener('terminate', handleTerminate);

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

        if (recognizer.recognizer?.objectHandle > -1) {
          recognizer.recognizer.delete?.();
        }
      }

      this.eventEmitter$.dispatchEvent(new Event('terminate:done'));
    };

    this.eventEmitter$.addEventListener('terminate', handleTerminate);

    // Get image file
    if (!configuration.file || !RegExp(/^image\//).exec(configuration.file.type)) {
      eventCallback({ status: RecognitionStatus.NoImageFileFound });
      window.setTimeout(() => void this.cancelRecognition(), 500);
      return;
    }

    const file = configuration.file;
    const imageElement = new Image();
    imageElement.src = URL.createObjectURL(file);
    await imageElement.decode();

    const imageFrame = BlinkIDSDK.captureFrame(imageElement);

    // Get results
    eventCallback({ status: RecognitionStatus.Processing });

    const processResult = await recognizerRunner.processImage(imageFrame);

    if (processResult !== BlinkIDSDK.RecognizerResultState.Empty) {
      for (const recognizer of recognizers) {
        const results = await recognizer.recognizer.getResult();

        if (!results || results.state === BlinkIDSDK.RecognizerResultState.Empty) {
          eventCallback({
            status: RecognitionStatus.EmptyResultState,
            data: {
              initiatedByUser: this.cancelInitiatedFromOutside,
              recognizerName: recognizer.name
            }
          });
        }
        else {
          const recognitionResults: RecognitionResults = {
            recognizer: results,
            imageCapture: _IS_IMAGE_CAPTURE,
            recognizerName: recognizer.name
          };

          if (configuration.recognizerOptions?.returnSignedJSON) {
            recognitionResults.resultSignedJSON = await recognizer.recognizer.toSignedJSON();
          }

          eventCallback({
            status: RecognitionStatus.ScanSuccessful,
            data: recognitionResults
          });
          break;
        }
      }
    }
    else {
      // If necessary, scan the image once again with different settings
      if (
        configuration.thoroughScan &&
        configuration.recognizers.indexOf('BlinkIdSingleSideRecognizer') > -1
      ) {
        const c = configuration;

        c.thoroughScan = false;
        c.recognizerOptions = c.recognizerOptions || {};

        for (const r of c.recognizers) {
          c.recognizerOptions[r] = c.recognizerOptions[r] || {};
          c.recognizerOptions[r].scanCroppedDocumentImage = !!c.recognizerOptions[r].scanCroppedDocumentImage;
          c.recognizerOptions[r].scanCroppedDocumentImage = !c.recognizerOptions[r].scanCroppedDocumentImage;
        }

        const eventHandler = (recognitionEvent: RecognitionEvent) => eventCallback(recognitionEvent);
        const handleTerminateDone = () => {
          this.eventEmitter$.removeEventListener('terminate:done', handleTerminateDone);
          this.scanFromImage(configuration, eventHandler);
        }
        this.eventEmitter$.addEventListener('terminate:done', handleTerminateDone);
        window.setTimeout(() => void this.cancelRecognition(), 500);
        return;
      }

      eventCallback({
        status: RecognitionStatus.EmptyResultState,
        data: {
          initiatedByUser: this.cancelInitiatedFromOutside,
          recognizerName: ''
        }
      });
    }

    window.setTimeout(() => void this.cancelRecognition(), 500);
  }

  public async scanFromImageMultiSide(
    configuration: MultiSideImageRecognitionConfiguration,
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

    const handleTerminate = async () => {
      this.eventEmitter$.removeEventListener('terminate', handleTerminate);

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

        if (recognizer.recognizer?.objectHandle > -1) {
          recognizer.recognizer.delete?.();
        }
      }

      this.eventEmitter$.dispatchEvent(new Event('terminate:done'));
    };

    this.eventEmitter$.addEventListener('terminate', handleTerminate);

    if (!configuration.firstFile) {
      eventCallback({ status: RecognitionStatus.NoFirstImageFileFound });
      window.setTimeout(() => void this.cancelRecognition(), 500);
      return;
    }

    if (!configuration.secondFile) {
      eventCallback({ status: RecognitionStatus.NoSecondImageFileFound });
      window.setTimeout(() => void this.cancelRecognition(), 500);
      return;
    }

    // Get results
    eventCallback({ status: RecognitionStatus.Processing });

    const imageElement = new Image();
    imageElement.src = URL.createObjectURL(configuration.firstFile);
    await imageElement.decode();

    const firstFrame = BlinkIDSDK.captureFrame(imageElement);
    const firstProcessResult = await recognizerRunner.processImage(firstFrame);

    if (firstProcessResult !== BlinkIDSDK.RecognizerResultState.Empty) {
      const imageElement = new Image();
      imageElement.src = URL.createObjectURL(configuration.secondFile);
      await imageElement.decode();

      const secondFrame = BlinkIDSDK.captureFrame(imageElement);
      const secondProcessResult = await recognizerRunner.processImage(secondFrame);

      if (secondProcessResult !== BlinkIDSDK.RecognizerResultState.Empty) {
        for (const recognizer of recognizers) {
          const results = await recognizer.recognizer.getResult();

          if (!results || results.state === BlinkIDSDK.RecognizerResultState.Empty) {
            eventCallback({
              status: RecognitionStatus.EmptyResultState,
              data: {
                initiatedByUser: this.cancelInitiatedFromOutside,
                recognizerName: recognizer.name
              }
            });
          }
          else {
            const recognitionResults: RecognitionResults = {
              recognizer: results,
              imageCapture: _IS_IMAGE_CAPTURE,
              recognizerName: recognizer.name
            };

            if (configuration.recognizerOptions?.returnSignedJSON) {
              recognitionResults.resultSignedJSON = await recognizer.recognizer.toSignedJSON();
            }

            eventCallback({
              status: RecognitionStatus.ScanSuccessful,
              data: recognitionResults
            });
            break;
          }
        }
      }
      else {
        eventCallback({
          status: RecognitionStatus.EmptyResultState,
          data: {
            initiatedByUser: this.cancelInitiatedFromOutside,
            recognizerName: ''
          }
        });
      }
    }
    else {
      // If necessary, scan the image once again with different settings
      if (
        configuration.thoroughScan &&
        configuration.recognizers.indexOf('BlinkIdMultiSideRecognizer') > -1
      ) {
        const c = configuration;

        c.thoroughScan = false;
        c.recognizerOptions = c.recognizerOptions || {};

        for (const r of c.recognizers) {
          c.recognizerOptions[r] = c.recognizerOptions[r] || {};
          c.recognizerOptions[r].scanCroppedDocumentImage = !!c.recognizerOptions[r].scanCroppedDocumentImage;
          c.recognizerOptions[r].scanCroppedDocumentImage = !c.recognizerOptions[r].scanCroppedDocumentImage;
        }

        const eventHandler = (recognitionEvent: RecognitionEvent) => eventCallback(recognitionEvent);
        const handleTerminateDone = () => {
          this.eventEmitter$.removeEventListener('terminate:done', handleTerminateDone);
          this.scanFromImageMultiSide(configuration, eventHandler);
        }
        this.eventEmitter$.addEventListener('terminate:done', handleTerminateDone);
        window.setTimeout(() => void this.cancelRecognition(), 500);
        return;
      }

      eventCallback({
        status: RecognitionStatus.EmptyResultState,
        data: {
          initiatedByUser: this.cancelInitiatedFromOutside,
          recognizerName: ''
        }
      });
    }

    window.setTimeout(() => void this.cancelRecognition(), 500);
  }

  public async stopRecognition() {
    void await this.cancelRecognition(true);
  }

  public async resumeRecognition(): Promise<void> {
    this.videoRecognizer.resumeRecognition(true);
  }

  public changeCameraDevice(camera: BlinkIDSDK.SelectedCamera): Promise<boolean> {
    return new Promise((resolve) => {
      this.videoRecognizer.changeCameraDevice(camera)
        .then(() => resolve(true))
        .catch(() => resolve(false));
    });
  }

  public getProductIntegrationInfo(): Promise<BlinkIDSDK.ProductIntegrationInfo> {
    return this.sdk.getProductIntegrationInfo();
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  // PRIVATE METHODS

  private isRecognizerAvailable(recognizer: string): boolean {
    return !!AvailableRecognizers[recognizer];
  }

  private async createRecognizers(
    recognizers: Array<string>,
    recognizerOptions?: any,
  ): Promise<Array<RecognizerInstance>> {
    const pureRecognizers = [];

    for (const recognizer of recognizers) {
      const instance = await BlinkIDSDK[AvailableRecognizers[recognizer]](this.sdk);
      pureRecognizers.push(instance);
    }

    if (recognizerOptions && Object.keys(recognizerOptions).length > 0) {
      for (const recognizer of pureRecognizers) {
        const settings = await recognizer.currentSettings();
        let updated = false;

        if (
          !recognizerOptions[recognizer.recognizerName] ||
          Object.keys(recognizerOptions[recognizer.recognizerName]).length < 1
        ) {
          continue;
        }

        for (const [key, value] of Object.entries(recognizerOptions[recognizer.recognizerName])) {
          if (key in settings) {
            settings[key] = value;
            updated = true;
          }
        }

        if (updated) {
          await recognizer.updateSettings(settings);
        }
      }
    }

    const recognizerInstances = [];

    for (let i = 0; i < pureRecognizers.length; ++i) {
      const recognizer = pureRecognizers[i];
      const instance: RecognizerInstance = { name: recognizers[i], recognizer }


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
          case BlinkIDSDK.DetectionStatus.Failed:
            eventCallback({ status: RecognitionStatus.DetectionStatusSuccess });
            break;

          case BlinkIDSDK.DetectionStatus.Success:
            eventCallback({ status: RecognitionStatus.DetectionStatusSuccess });
            break;

          case BlinkIDSDK.DetectionStatus.CameraTooFar:
            eventCallback({ status: RecognitionStatus.DetectionStatusCameraTooHigh });
            break;

          case BlinkIDSDK.DetectionStatus.FallbackSuccess:
            eventCallback({ status: RecognitionStatus.DetectionStatusFallbackSuccess });
            break;

          case BlinkIDSDK.DetectionStatus.DocumentPartiallyVisible:
            eventCallback({ status: RecognitionStatus.DetectionStatusPartial });
            break;

          case BlinkIDSDK.DetectionStatus.CameraAngleTooSteep:
            eventCallback({ status: RecognitionStatus.DetectionStatusCameraAtAngle });
            break;

          case BlinkIDSDK.DetectionStatus.CameraTooClose:
            eventCallback({ status: RecognitionStatus.DetectionStatusCameraTooNear });
            break;

          case BlinkIDSDK.DetectionStatus.DocumentTooCloseToCameraEdge:
            eventCallback({ status: RecognitionStatus.DetectionStatusDocumentTooCloseToEdge });
            break;

          default:
            // Send nothing
        }
      }
    }

    const blinkIdSingleSide = recognizers.find(el => el.recognizer.recognizerName === 'BlinkIdSingleSideRecognizer');
    const blinkIdMultiSide = recognizers.find(el => el.recognizer.recognizerName === 'BlinkIdMultiSideRecognizer');

    if (blinkIdSingleSide || blinkIdMultiSide) {
      for (const el of recognizers) {
        if (
          el.recognizer.recognizerName === 'BlinkIdSingleSideRecognizer' ||
          el.recognizer.recognizerName === 'BlinkIdMultiSideRecognizer'
        ) {
          const settings = await el.recognizer.currentSettings() as BlinkIDSDK.BlinkIdSingleSideRecognizerSettings;
          settings.barcodeScanningStartedCallback = () => eventCallback({ status: RecognitionStatus.BarcodeScanningStarted });
          settings.classifierCallback = (supported: boolean) => {
            eventCallback({ status: RecognitionStatus.DocumentClassified, data: supported });
          }
          await el.recognizer.updateSettings(settings);
        }
      }
    }

    if (blinkIdMultiSide) {
      metadataCallbacks.onFirstSideResult = () => eventCallback({ status: RecognitionStatus.OnFirstSideResult });
    }

    const recognizerRunner = await BlinkIDSDK.createRecognizerRunner(
      this.sdk,
      recognizers.map((el: RecognizerInstance) =>  el.recognizer),
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
