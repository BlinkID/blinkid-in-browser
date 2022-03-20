/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  h,
  Prop,
  Method
} from '@stencil/core';

import {
  EventReady,
  EventScanError,
  EventScanSuccess,
  FeedbackMessage,
  MicroblinkUI,
  SDKError,
  ProductIntegrationInfo
} from '../../utils/data-structures';

import { SdkService } from '../../utils/sdk.service';
import { TranslationService } from '../../utils/translation.service';
import * as GenericHelpers from '../../utils/generic.helpers';

@Component({
  tag: 'blinkid-in-browser',
  styleUrl: 'blinkid-in-browser.scss',
  shadow: true,
})
export class BlinkidInBrowser implements MicroblinkUI {
  private blocked: boolean = false;

  /**
   * Write a hello message to the browser console when license check is successfully performed.
   *
   * Hello message will contain the name and version of the SDK, which are required information for all support
   * tickets.
   *
   * Default value is true.
   */
  @Prop() allowHelloMessage: boolean = true;

  /**
   * Absolute location of WASM and related JS/data files. Useful when resource files should be loaded over CDN, or
   * when web frameworks/libraries are used which store resources in specific locations, e.g. inside "assets" folder.
   *
   * Important: if engine is hosted on another origin, CORS must be enabled between two hosts. That is, server where
   * engine is hosted must have 'Access-Control-Allow-Origin' header for the location of the web app.
   *
   * Important: SDK and WASM resources must be from the same version of package.
   *
   * Default value is empty string, i.e. "". In case of empty string, value of "window.location.origin" property is
   * going to be used.
   */
  @Prop() engineLocation: string = '';

  /**
   * License key which is going to be used to unlock WASM library.
   *
   * Keep in mind that UI component will reinitialize every time license key is changed.
   */
  @Prop() licenseKey: string;

  /**
   * Defines the type of the WebAssembly build that will be loaded. If omitted, SDK will determine
   * the best possible WebAssembly build which should be loaded based on the browser support.
   *
   * Available WebAssembly builds:
   *
   * - 'BASIC'
   * - 'ADVANCED'
   * - 'ADVANCED_WITH_THREADS'
   *
   * For more information about different WebAssembly builds, check out the `src/MicroblinkSDK/WasmType.ts` file.
   */
   @Prop() wasmType: string = '';

  /**
   * List of recognizers which should be used.
   *
   * Available recognizers for BlinkID:
   *
   * - IdBarcodeRecognizer
   * - BlinkIdRecognizer
   * - BlinkIdCombinedRecognizer
   *    - cannot be used in combination with other recognizers
   *    - when defined, scan from image is not available
   *
   * Recognizers can be defined by setting HTML attribute "recognizers", for example:
   *
   * `<blinkid-in-browser recognizers="IdBarcodeRecognizer,BlinkIdRecognizer"></blinkid-in-browser>`
   */
  @Prop({ attribute: 'recognizers' }) rawRecognizers: string;

  /**
   * List of recognizers which should be used.
   *
   * Available recognizers for BlinkID:
   *
   * - IdBarcodeRecognizer
   * - BlinkIdRecognizer
   * - BlinkIdCombinedRecognizer
   *    - cannot be used in combination with other recognizers
   *    - when defined, scan from image is not available
   *
   * Recognizers can be defined by setting JS property "recognizers", for example:
   *
   * ```
   * const blinkId = document.querySelector('blinkid-in-browser');
   * blinkId.recognizers = ['IdBarcodeRecognizer', 'BlinkIdRecognizer'];
   * ```
   */
  @Prop() recognizers: Array<string>;

  /**
   * Specify recognizer options. This option can only bet set as a JavaScript property.
   *
   * Pass an object to `recognizerOptions` property where each key represents a recognizer, while
   * the value represents desired recognizer options.
   *
   * ```
   * blinkId.recognizerOptions = {
   *   'BlinkIdRecognizer': {
   *     'returnFullDocumentImage': true,
   *
   *     // When setting values for enums, check the source code to see possible values.
   *     // For AnonymizationMode we can see the list of possible values in
   *     // `src/Recognizers/BlinkID/Generic/AnonymizationMode.ts` file.
   *     'anonymizationMode': 0
   *   }
   * }
   * ```
   *
   * For a full list of available recognizer options see source code of a recognizer. For example,
   * list of available recognizer options for BlinkIdRecognizer can be seen in the
   * `src/Recognizers/BlinkID/Generic/BlinkIdRecognizer.ts` file.
   */
  @Prop() recognizerOptions: { [key: string]: any };

  /**
   * Amount of time in milliseconds before the recognition process is cancelled regardless of
   * whether recognition was successful or not.
   *
   * This setting applies only to video recognition.
   *
   * Keep in mind that the timer starts after the first non-empty result. This behaviour ensures
   * that the user has enough time to take out the document and place it in front of the camera
   * device.
   */
  @Prop() recognitionTimeout: number;

  /**
   * Set to 'true' if success frame should be included in final scanning results.
   *
   * Default value is 'false'.
   */
  @Prop() includeSuccessFrame: boolean = false;

  /**
   * Set to 'false' if component should not enable drag and drop functionality.
   *
   * Default value is 'true'.
   */
  @Prop() enableDrag: boolean = true;

  /**
   * If set to 'true', UI component will not display feedback, i.e. information and error messages.
   *
   * Setting this attribute to 'false' won't disable 'scanError' and 'scanInfo' events.
   *
   * Default value is 'false'.
   */
  @Prop() hideFeedback: boolean = false;

  /**
   * If set to 'true', UI component will become visible after successful SDK initialization. Also, error screen
   * is not going to be displayed in case of initialization error.
   *
   * If set to 'false', loading and error screens of the UI component will be visible during initialization and in case
   * of an error.
   *
   * Default value is 'false'.
   */
  @Prop() hideLoadingAndErrorUi: boolean = false;

  /**
   * Set to 'true' if scan from camera should be enabled. If set to 'true' and camera is not available or disabled,
   * related button will be visible but disabled.
   *
   * Default value is 'true'.
   */
  @Prop() scanFromCamera: boolean = true;

  /**
   * Set to 'true' if scan from image should be enabled.
   *
   * Default value is 'true'.
   */
  @Prop() scanFromImage: boolean = true;

  /**
   * Set to 'true' if scan from image should execute twice in case that first result is empty.
   *
   * If enabled, this option will add/remove 'scanCroppedDocumentImage' recognizer option for the
   * second scan action.
   */
  @Prop() thoroughScanFromImage: boolean = false;

  /**
   * Define whether to use 'FULLSCREEN' or 'INLINE' gallery overlay type.
   *
   * If 'FULLSCREEN' is used, when a user selects an image from which data should be extracted, an overlay will pop up
   * and cover the whole screen.
   *
   * On the other hand, if 'INLINE' is used, there is no overlay but rather a 'Processing' message inside the UI
   * component.
   *
   * Default value is 'INLINE'.
   */
  @Prop() galleryOverlayType: 'FULLSCREEN' | 'INLINE' = 'INLINE';

  /**
   * Define whether to use 'FULLSCREEN' or 'INLINE' gallery dropdown type.
   *
   * If 'FULLSCREEN' is used, when a user drags an image over the UI component, an overlay will pop up and cover the
   * whole screen.
   *
   * If 'INLINE' is used, there is no fullscreen overlay, but rather the overlay is restricted to the size of the UI
   * component.
   *
   * Default value is 'INLINE'.
   */
  @Prop() galleryDropType: 'FULLSCREEN' | 'INLINE' = 'INLINE';

  /**
   * Set to 'true' if text labels should be displayed below action buttons.
   *
   * Default value is 'false'.
   */
  @Prop() showActionLabels: boolean = false;

  /**
   * Set to 'true' if modal window should be displayed in case of an error.
   *
   * Default value is 'false'.
   */
  @Prop() showModalWindows: boolean = false;

  /**
   * Set to 'true' if for Barcode scanning camera feedback message should be displayed on camera screen.
   *
   * Default value is 'false'.
   */
   @Prop() showCameraFeedbackBarcodeMessage: boolean = false;

  /**
   * Set custom translations for UI component. List of available translation keys can be found in
   * `src/utils/translation.service.ts` file.
   */
  @Prop({ attribute: 'translations' }) rawTranslations: string;

  /**
   * Set custom translations for UI component. List of available translation keys can be found in
   * `src/utils/translation.service.ts` file.
   */
  @Prop() translations: { [key: string]: string };

  /**
   * Provide alternative camera icon.
   *
   * Every value that is placed here is passed as a value of `src` attribute to <img> element. This attribute can be
   * used to provide location, base64 or any URL of alternative camera icon.
   *
   * Image is scaled to 20x20 pixels.
   */
  @Prop() iconCameraDefault: string;

  /**
   * Hover state of iconCameraDefault.
   */
  @Prop() iconCameraActive: string;

  /**
   * Provide alternative gallery icon. This icon is also used during drag and drop action.
   *
   * Every value that is placed here is passed as a value of `src` attribute to <img> element. This attribute can be
   * used to provide location, base64 or any URL of alternative gallery icon.
   *
   * Image is scaled to 20x20 pixels. In drag and drop dialog image is scaled to 24x24 pixels.
   */
  @Prop() iconGalleryDefault: string;

  /**
   * Hover state of iconGalleryDefault.
   */
  @Prop() iconGalleryActive: string;

  /**
   * Provide alternative invalid format icon which is used during drag and drop action.
   *
   * Every value that is placed here is passed as a value of `src` attribute to <img> element. This attribute can be
   * used to provide location, base64 or any URL of alternative icon.
   *
   * Image is scaled to 24x24 pixels.
   */
  @Prop() iconInvalidFormat: string;

  /**
   * Provide alternative loading icon. CSS rotation is applied to this icon.
   *
   * Every value that is placed here is passed as a value of `src` attribute to <img> element. This attribute can be
   * used to provide location, base64 or any URL of alternative icon.
   *
   * Image is scaled to 24x24 pixels.
   */
  @Prop() iconSpinnerScreenLoading: string;

  /**
   * Provide alternative loading icon. CSS rotation is applied to this icon.
   *
   * Every value that is placed here is passed as a value of `src` attribute to <img> element. This attribute can be
   * used to provide location, base64 or any URL of alternative icon.
   *
   * Image is scaled to 24x24 pixels.
   */
  @Prop() iconSpinnerFromGalleryExperience: string;

  /**
   * Provide alternative completed icon. This icon is used when gallery scanning process is done, in case that
   * `galleryOverlayType` property is set to `INLINE`.
   *
   * Every value that is placed here is passed as a value of `src` attribute to <img> element. This attribute can be
   * used to provide location, base64 or any URL of alternative icon.
   *
   * Image is scaled to 24x24 pixels.
   */
  @Prop() iconGalleryScanningCompleted: string;

  /**
   * Camera device ID passed from root component.
   *
   * Client can choose which camera to turn on if array of cameras exists.
   *
   */
  @Prop() cameraId: string | null = null;

  /**
   * Event which is emitted during initialization of UI component.
   *
   * Each event contains `code` property which has deatils about fatal errror.
   */
  @Event() fatalError: EventEmitter<SDKError>;

  /**
   * Event which is emitted when UI component is successfully initialized and ready for use.
   */
  @Event() ready: EventEmitter<EventReady>;

  /**
   * Event which is emitted during or immediately after scan error.
   */
  @Event() scanError: EventEmitter<EventScanError>;

  /**
   * Event which is emitted after successful scan. This event contains recognition results.
   */
  @Event() scanSuccess: EventEmitter<EventScanSuccess>;

  /**
   * Event which is emitted during positive or negative user feedback. If attribute/property
   * `hideFeedback` is set to `false`, UI component will display the feedback.
   */
  @Event() feedback: EventEmitter<FeedbackMessage>;

  /**
   * Event which is emitted when camera scan is started, i.e. when user clicks on
   * _scan from camera_ button.
   */
  @Event() cameraScanStarted: EventEmitter<null>;

  /**
   * Event which is emitted when image scan is started, i.e. when user clicks on
   * _scan from gallery button.
   */
  @Event() imageScanStarted: EventEmitter<null>;

  /**
   * Event which is emitted when scan is aborted, i.e. when user clicks on
   * close from the gallery toolbar, or presses escape key.
   */
  @Event() scanAborted: EventEmitter<null>;

  /**
   * Control UI state of camera overlay.
   *
   * Possible values are 'ERROR' | 'LOADING' | 'NONE' | 'SUCCESS'.
   *
   * In case of state `ERROR` and if `showModalWindows` is set to `true`, modal window
   * with error message will be displayed. Otherwise, UI will close.
   */
  @Method()
  async setUiState(state: 'ERROR' | 'LOADING' | 'NONE' | 'SUCCESS') {
    this.mbComponentEl.setUiState(state);
  }

  /**
   * Starts camera scan using camera overlay with usage instructions.
   */
  @Method()
  async startCameraScan() {
    this.mbComponentEl.startCameraScan();
  }

  /**
   * Starts image scan, emits results from provided file.
   *
   * @param file File to scan
   */
  @Method()
  async startImageScan(file: File) {
    this.mbComponentEl.startImageScan(file);
  }

  /**
   * Starts combined image scan, emits results from provided files.
   *
   * @param firstFile File to scan as first image
   * @param secondFile File to scan as second image
   */
  @Method()
  async startCombinedImageScan(firstFile: File, secondFile: File) {
    this.mbComponentEl.startCombinedImageScan(firstFile, secondFile);
  }

  /**
   * Show message alongside UI component.
   *
   * Possible values for `state` are 'FEEDBACK_ERROR' | 'FEEDBACK_INFO' | 'FEEDBACK_OK'.
   */
  @Method()
  async setUiMessage(state: 'FEEDBACK_ERROR' | 'FEEDBACK_INFO' | 'FEEDBACK_OK', message: string) {
    this.feedbackEl.show({ state, message });
  }

  /**
   * Get information about product integration.
   */
  @Method()
  async getProductIntegrationInfo(): Promise<ProductIntegrationInfo> {
    return this.sdkService?.getProductIntegrationInfo();
  }

  @Element() hostEl: HTMLElement;

  componentWillLoad() {
    this.init();
  }

  componentWillUpdate() {
    if (this.blocked) {
      return;
    }

    this.sdkService?.delete();
    this.init();
  }

  disconnectedCallback() {
    this.sdkService?.delete();
  }

  private init() {
    const rawRecognizers = GenericHelpers.stringToArray(this.rawRecognizers);
    this.finalRecognizers = this.recognizers ? this.recognizers : rawRecognizers;

    const rawTranslations = GenericHelpers.stringToObject(this.rawTranslations);
    this.finalTranslations = this.translations ? this.translations : rawTranslations;
    this.translationService = new TranslationService(this.finalTranslations || {});

    this.sdkService = new SdkService();
  }

  render() {
    return (
      <Host>
        <mb-container>
          <mb-component dir={ this.hostEl.getAttribute('dir') }
                        ref={ el => this.mbComponentEl = el as HTMLMbComponentElement }
                        allowHelloMessage={ this.allowHelloMessage }
                        engineLocation={ this.engineLocation }
                        licenseKey={ this.licenseKey }
                        wasmType={ this.wasmType }
                        recognizers={ this.finalRecognizers }
                        recognizerOptions={ this.recognizerOptions }
                        recognitionTimeout={ this.recognitionTimeout }
                        includeSuccessFrame={ this.includeSuccessFrame }
                        enableDrag={ this.enableDrag }
                        hideLoadingAndErrorUi={ this.hideLoadingAndErrorUi }
                        scanFromCamera={ this.scanFromCamera }
                        scanFromImage={ this.scanFromImage }
                        thoroughScanFromImage={ this.thoroughScanFromImage }
                        galleryOverlayType={ this.galleryOverlayType }
                        galleryDropType={ this.galleryDropType }
                        showActionLabels={ this.showActionLabels }
                        showModalWindows={ this.showModalWindows }
                        showCameraFeedbackBarcodeMessage={this.showCameraFeedbackBarcodeMessage}
                        iconCameraDefault={ this.iconCameraDefault}
                        iconCameraActive={ this.iconCameraActive }
                        iconGalleryDefault={ this.iconGalleryDefault }
                        iconGalleryActive={ this.iconGalleryActive }
                        iconInvalidFormat={ this.iconInvalidFormat }
                        iconSpinnerScreenLoading={ this.iconSpinnerScreenLoading }
                        iconSpinnerFromGalleryExperience={ this.iconSpinnerFromGalleryExperience }
                        iconGalleryScanningCompleted={ this.iconGalleryScanningCompleted }
                        sdkService={ this.sdkService }
                        translationService={ this.translationService }
                        cameraId={ this.cameraId }
                        onBlock={ (ev: CustomEvent<boolean>) => { this.blocked = ev.detail } }
                        onFeedback={ (ev: CustomEvent<FeedbackMessage>) => this.feedbackEl.show(ev.detail) }></mb-component>
          <mb-feedback dir={ this.hostEl.getAttribute('dir') }
                       visible={ !this.hideFeedback }
                       ref={ el => this.feedbackEl = el as HTMLMbFeedbackElement }></mb-feedback>
        </mb-container>
      </Host>
    );
  }

  private sdkService: SdkService;
  private translationService: TranslationService;

  private finalRecognizers: Array<string>;
  private finalTranslations: { [key: string]: string };

  private feedbackEl!: HTMLMbFeedbackElement;
  private mbComponentEl!: HTMLMbComponentElement;
}
