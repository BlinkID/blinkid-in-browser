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
  EventFatalError,
  EventReady,
  EventScanError,
  EventScanSuccess,
  FeedbackMessage,
  MicroblinkUI
} from '../../utils/data-structures';

import { TranslationService } from '../../utils/translation.service';

import * as GenericHelpers from '../../utils/generic.helpers';

@Component({
  tag: 'blinkid-in-browser',
  styleUrl: 'blinkid-in-browser.scss',
  shadow: true,
})
export class BlinkidInBrowser implements MicroblinkUI {

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
   * Specify additional recognizer options.
   *
   * Example: @TODO
   */
  @Prop({ attribute: 'recognizer-options' }) rawRecognizerOptions: string;

  /**
   * Specify additional recognizer options.
   *
   * Example: @TODO
   */
  @Prop() recognizerOptions: Array<string>;

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
   * used to provide location, base64 or any URL of alternative gallery icon.
   *
   * Image is scaled to 24x24 pixels.
   */
  @Prop() iconInvalidFormat: string;

  /**
   * Provide alternative loading icon. CSS rotation is applied to this icon.
   *
   * Every value that is placed here is passed as a value of `src` attribute to <img> element. This attribute can be
   * used to provide location, base64 or any URL of alternative gallery icon.
   *
   * Image is scaled to 24x24 pixels.
   */
  @Prop() iconSpinner: string;

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
  @Event() fatalError: EventEmitter<EventFatalError>;

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
   * Control UI state of camera overlay.
   *
   * Possible values are 'ERROR' | 'LOADING' | 'NONE' | 'SUCCESS'.
   */
  @Method()
  async setUiState(state: 'ERROR' | 'LOADING' | 'NONE' | 'SUCCESS') {
    this.mbComponentEl.setUiState(state);
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

  @Element() hostEl: HTMLElement;

  async componentWillRender() {
    const rawRecognizers = GenericHelpers.stringToArray(this.rawRecognizers);
    this.finalRecognizers = this.recognizers ? this.recognizers : rawRecognizers;

    const rawRecognizerOptions = GenericHelpers.stringToArray(this.rawRecognizerOptions);
    this.finalRecognizerOptions = this.recognizerOptions ? this.recognizerOptions : rawRecognizerOptions;

    const rawTranslations = GenericHelpers.stringToObject(this.rawTranslations);
    this.finalTranslations = this.translations ? this.translations : rawTranslations;
    this.translationService = new TranslationService(this.finalTranslations || {});
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
                        recognizers={ this.finalRecognizers }
                        recognizerOptions={ this.finalRecognizerOptions }
                        includeSuccessFrame={ this.includeSuccessFrame }
                        enableDrag={ this.enableDrag }
                        hideLoadingAndErrorUi={ this.hideLoadingAndErrorUi }
                        scanFromCamera={ this.scanFromCamera }
                        scanFromImage={ this.scanFromImage }
                        iconCameraDefault={ this.iconCameraDefault}
                        iconCameraActive={ this.iconCameraActive }
                        iconGalleryDefault={ this.iconGalleryDefault }
                        iconGalleryActive={ this.iconGalleryActive }
                        iconInvalidFormat={ this.iconInvalidFormat }
                        iconSpinner={ this.iconSpinner }
                        translationService={ this.translationService }
                        cameraId={ this.cameraId }
                        onFeedback={ (ev: CustomEvent<FeedbackMessage>) => this.feedbackEl.show(ev.detail) }></mb-component>
          <mb-feedback dir={ this.hostEl.getAttribute('dir') }
                       visible={ !this.hideFeedback }
                       ref={ el => this.feedbackEl = el as HTMLMbFeedbackElement }></mb-feedback>
        </mb-container>
      </Host>
    );
  }

  private translationService: TranslationService;

  private finalRecognizers: Array<string>;
  private finalRecognizerOptions: Array<string>;
  private finalTranslations: { [key: string]: string };

  private feedbackEl!: HTMLMbFeedbackElement;
  private mbComponentEl!: HTMLMbComponentElement;
}
