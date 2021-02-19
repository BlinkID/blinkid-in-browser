/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import {
  Component,
  Event,
  EventEmitter,
  Host,
  h,
  Prop,
  Element,
  Method
} from '@stencil/core';

import {
  CameraExperienceState,
  Code,
  EventFatalError,
  EventReady,
  EventScanError,
  EventScanSuccess,
  FeedbackCode,
  FeedbackMessage,
  RecognitionEvent,
  RecognitionStatus,
  ImageRecognitionConfiguration,
  VideoRecognitionConfiguration
} from '../../../utils/data-structures';

import {
  SdkService,
  CheckConclusion
} from '../../../utils/sdk.service';

import { TranslationService } from '../../../utils/translation.service';

import * as DeviceHelpers from '../../../utils/device.helpers';
import * as GenericHelpers from '../../../utils/generic.helpers';

@Component({
  tag: 'mb-component',
  styleUrl: 'mb-component.scss',
  shadow: true,
})
export class MbComponent {

  /**
   * See description in public component.
   */
  @Prop() allowHelloMessage: boolean = true;

  /**
   * See description in public component.
   */
  @Prop() engineLocation: string = '';

  /**
   * See description in public component.
   */
  @Prop() licenseKey: string;

  /**
   * See description in public component.
   */
  @Prop({ mutable: true }) recognizers: Array<string>;

  /**
   * See description in public component.
   */
  @Prop({ mutable: true }) recognizerOptions: Array<string>;

  /**
   * See description in public component.
   */
  @Prop() includeSuccessFrame: boolean = false;

  /**
   * See description in public component.
   */
  @Prop() enableDrag: boolean = true;

  /**
   * See description in public component.
   */
  @Prop() hideLoadingAndErrorUi: boolean = false;

  /**
   * See description in public component.
   */
  @Prop() rtl: boolean = false;

  /**
   * See description in public component.
   */
  @Prop() scanFromCamera: boolean = true;

  /**
   * See description in public component.
   */
  @Prop() scanFromImage: boolean = true;

  /**
   * See description in public component.
   */
  @Prop() thoroughScanFromImage: boolean = false;

  /**
   * See description in public component.
   */
  @Prop() showActionLabels: boolean = false;

  /**
   * See description in public component.
   */
  @Prop() showModalWindows: boolean = false;

  /**
   * See description in public component.
   */
  @Prop() showScanningLine: boolean = false;

  /**
   * See description in public component.
   */
  @Prop() iconCameraDefault: string = 'data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.32151 2.98816C6.63407 2.6756 7.05799 2.5 7.50002 2.5H12.5C12.942 2.5 13.366 2.6756 13.6785 2.98816C13.9911 3.30072 14.1667 3.72464 14.1667 4.16667C14.1667 4.38768 14.2545 4.59964 14.4108 4.75592C14.567 4.9122 14.779 5 15 5H15.8334C16.4964 5 17.1323 5.26339 17.6011 5.73223C18.07 6.20107 18.3334 6.83696 18.3334 7.5V15C18.3334 15.663 18.07 16.2989 17.6011 16.7678C17.1323 17.2366 16.4964 17.5 15.8334 17.5H4.16669C3.50365 17.5 2.86776 17.2366 2.39892 16.7678C1.93008 16.2989 1.66669 15.663 1.66669 15V7.5C1.66669 6.83696 1.93008 6.20107 2.39892 5.73223C2.86776 5.26339 3.50365 5 4.16669 5H5.00002C5.22103 5 5.433 4.9122 5.58928 4.75592C5.74556 4.59964 5.83335 4.38768 5.83335 4.16667C5.83335 3.72464 6.00895 3.30072 6.32151 2.98816ZM4.16669 6.66667C3.94567 6.66667 3.73371 6.75446 3.57743 6.91074C3.42115 7.06702 3.33335 7.27899 3.33335 7.5V15C3.33335 15.221 3.42115 15.433 3.57743 15.5893C3.73371 15.7455 3.94567 15.8333 4.16669 15.8333H15.8334C16.0544 15.8333 16.2663 15.7455 16.4226 15.5893C16.5789 15.433 16.6667 15.221 16.6667 15V7.5C16.6667 7.27899 16.5789 7.06702 16.4226 6.91074C16.2663 6.75446 16.0544 6.66667 15.8334 6.66667H15C14.337 6.66667 13.7011 6.40327 13.2323 5.93443C12.7634 5.46559 12.5 4.82971 12.5 4.16667L7.50002 4.16667C7.50002 4.82971 7.23663 5.46559 6.76779 5.93443C6.29895 6.40327 5.66306 6.66667 5.00002 6.66667H4.16669Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 9.16667C9.07955 9.16667 8.33335 9.91286 8.33335 10.8333C8.33335 11.7538 9.07955 12.5 10 12.5C10.9205 12.5 11.6667 11.7538 11.6667 10.8333C11.6667 9.91286 10.9205 9.16667 10 9.16667ZM6.66669 10.8333C6.66669 8.99238 8.15907 7.5 10 7.5C11.841 7.5 13.3334 8.99238 13.3334 10.8333C13.3334 12.6743 11.841 14.1667 10 14.1667C8.15907 14.1667 6.66669 12.6743 6.66669 10.8333Z" fill="black"/></svg>';

  /**
   * See description in public component.
   */
  @Prop() iconCameraActive: string = 'data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.32151 2.98816C6.63407 2.6756 7.05799 2.5 7.50002 2.5H12.5C12.942 2.5 13.366 2.6756 13.6785 2.98816C13.9911 3.30072 14.1667 3.72464 14.1667 4.16667C14.1667 4.38768 14.2545 4.59964 14.4108 4.75592C14.567 4.9122 14.779 5 15 5H15.8334C16.4964 5 17.1323 5.26339 17.6011 5.73223C18.07 6.20107 18.3334 6.83696 18.3334 7.5V15C18.3334 15.663 18.07 16.2989 17.6011 16.7678C17.1323 17.2366 16.4964 17.5 15.8334 17.5H4.16669C3.50365 17.5 2.86776 17.2366 2.39892 16.7678C1.93008 16.2989 1.66669 15.663 1.66669 15V7.5C1.66669 6.83696 1.93008 6.20107 2.39892 5.73223C2.86776 5.26339 3.50365 5 4.16669 5H5.00002C5.22103 5 5.433 4.9122 5.58928 4.75592C5.74556 4.59964 5.83335 4.38768 5.83335 4.16667C5.83335 3.72464 6.00895 3.30072 6.32151 2.98816ZM4.16669 6.66667C3.94567 6.66667 3.73371 6.75446 3.57743 6.91074C3.42115 7.06702 3.33335 7.27899 3.33335 7.5V15C3.33335 15.221 3.42115 15.433 3.57743 15.5893C3.73371 15.7455 3.94567 15.8333 4.16669 15.8333H15.8334C16.0544 15.8333 16.2663 15.7455 16.4226 15.5893C16.5789 15.433 16.6667 15.221 16.6667 15V7.5C16.6667 7.27899 16.5789 7.06702 16.4226 6.91074C16.2663 6.75446 16.0544 6.66667 15.8334 6.66667H15C14.337 6.66667 13.7011 6.40327 13.2323 5.93443C12.7634 5.46559 12.5 4.82971 12.5 4.16667L7.50002 4.16667C7.50002 4.82971 7.23663 5.46559 6.76779 5.93443C6.29895 6.40327 5.66306 6.66667 5.00002 6.66667H4.16669Z" fill="%2348B2E8"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 9.16667C9.07955 9.16667 8.33335 9.91286 8.33335 10.8333C8.33335 11.7538 9.07955 12.5 10 12.5C10.9205 12.5 11.6667 11.7538 11.6667 10.8333C11.6667 9.91286 10.9205 9.16667 10 9.16667ZM6.66669 10.8333C6.66669 8.99238 8.15907 7.5 10 7.5C11.841 7.5 13.3334 8.99238 13.3334 10.8333C13.3334 12.6743 11.841 14.1667 10 14.1667C8.15907 14.1667 6.66669 12.6743 6.66669 10.8333Z" fill="%2348B2E8"/></svg>';

  /**
   * See description in public component.
   */
  @Prop() iconGalleryDefault: string = 'data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.6667 6.66666C11.6667 6.20642 12.0398 5.83333 12.5 5.83333H12.5084C12.9686 5.83333 13.3417 6.20642 13.3417 6.66666C13.3417 7.1269 12.9686 7.5 12.5084 7.5H12.5C12.0398 7.5 11.6667 7.1269 11.6667 6.66666Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M5.83333 4.16667C4.91286 4.16667 4.16667 4.91286 4.16667 5.83333V14.1667C4.16667 15.0871 4.91286 15.8333 5.83333 15.8333H14.1667C15.0871 15.8333 15.8333 15.0871 15.8333 14.1667V5.83333C15.8333 4.91286 15.0871 4.16667 14.1667 4.16667H5.83333ZM2.5 5.83333C2.5 3.99238 3.99238 2.5 5.83333 2.5H14.1667C16.0076 2.5 17.5 3.99238 17.5 5.83333V14.1667C17.5 16.0076 16.0076 17.5 14.1667 17.5H5.83333C3.99238 17.5 2.5 16.0076 2.5 14.1667V5.83333Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.24972 9.76212L3.92259 13.0892C3.59715 13.4147 3.06951 13.4147 2.74408 13.0892C2.41864 12.7638 2.41864 12.2362 2.74408 11.9107L6.07741 8.57741L6.08885 8.56618C6.59083 8.08315 7.22016 7.7751 7.91667 7.7751C8.61317 7.7751 9.2425 8.08315 9.74448 8.56618L9.75592 8.57741L13.9226 12.7441C14.248 13.0695 14.248 13.5971 13.9226 13.9226C13.5972 14.248 13.0695 14.248 12.7441 13.9226L8.58361 9.76212C8.32758 9.51773 8.09662 9.44177 7.91667 9.44177C7.73672 9.44177 7.50575 9.51773 7.24972 9.76212Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M13.083 11.4288L12.2559 12.2559C11.9305 12.5814 11.4028 12.5814 11.0774 12.2559C10.752 11.9305 10.752 11.4028 11.0774 11.0774L11.9107 10.2441L11.9222 10.2329C12.4241 9.74982 13.0535 9.44177 13.75 9.44177C14.4465 9.44177 15.0758 9.74982 15.5778 10.2329L15.5892 10.2441L17.2559 11.9107C17.5813 12.2362 17.5813 12.7638 17.2559 13.0893C16.9305 13.4147 16.4028 13.4147 16.0774 13.0893L14.4169 11.4288C14.1609 11.1844 13.9299 11.1084 13.75 11.1084C13.57 11.1084 13.3391 11.1844 13.083 11.4288Z" fill="black"/></svg>';

  /**
   * See description in public component.
   */
  @Prop() iconGalleryActive: string = 'data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.6667 6.66667C11.6667 6.20643 12.0398 5.83334 12.5 5.83334H12.5084C12.9686 5.83334 13.3417 6.20643 13.3417 6.66667C13.3417 7.12691 12.9686 7.5 12.5084 7.5H12.5C12.0398 7.5 11.6667 7.12691 11.6667 6.66667Z" fill="%2348B2E8"/><path fill-rule="evenodd" clip-rule="evenodd" d="M5.83333 4.16667C4.91286 4.16667 4.16667 4.91286 4.16667 5.83333V14.1667C4.16667 15.0871 4.91286 15.8333 5.83333 15.8333H14.1667C15.0871 15.8333 15.8333 15.0871 15.8333 14.1667V5.83333C15.8333 4.91286 15.0871 4.16667 14.1667 4.16667H5.83333ZM2.5 5.83333C2.5 3.99238 3.99238 2.5 5.83333 2.5H14.1667C16.0076 2.5 17.5 3.99238 17.5 5.83333V14.1667C17.5 16.0076 16.0076 17.5 14.1667 17.5H5.83333C3.99238 17.5 2.5 16.0076 2.5 14.1667V5.83333Z" fill="%2348B2E8"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.24972 9.76213L3.92259 13.0893C3.59715 13.4147 3.06951 13.4147 2.74408 13.0893C2.41864 12.7638 2.41864 12.2362 2.74408 11.9107L6.07741 8.57741L6.08885 8.56619C6.59083 8.08316 7.22016 7.77511 7.91667 7.77511C8.61317 7.77511 9.2425 8.08316 9.74448 8.56619L9.75592 8.57741L13.9226 12.7441C14.248 13.0695 14.248 13.5972 13.9226 13.9226C13.5972 14.248 13.0695 14.248 12.7441 13.9226L8.58361 9.76213C8.32758 9.51774 8.09662 9.44177 7.91667 9.44177C7.73672 9.44177 7.50575 9.51774 7.24972 9.76213Z" fill="%2348B2E8"/><path fill-rule="evenodd" clip-rule="evenodd" d="M13.083 11.4288L12.2559 12.2559C11.9305 12.5814 11.4028 12.5814 11.0774 12.2559C10.752 11.9305 10.752 11.4028 11.0774 11.0774L11.9107 10.2441L11.9222 10.2329C12.4241 9.74982 13.0535 9.44177 13.75 9.44177C14.4465 9.44177 15.0758 9.74982 15.5778 10.2329L15.5892 10.2441L17.2559 11.9107C17.5813 12.2362 17.5813 12.7638 17.2559 13.0893C16.9305 13.4147 16.4028 13.4147 16.0774 13.0893L14.4169 11.4288C14.1609 11.1844 13.9299 11.1084 13.75 11.1084C13.57 11.1084 13.3391 11.1844 13.083 11.4288Z" fill="%2348B2E8"/></svg>';

  /**
   * See description in public component.
   */
  @Prop() iconInvalidFormat: string = 'data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9.29289 9.29289C9.68342 8.90237 10.3166 8.90237 10.7071 9.29289L12 10.5858L13.2929 9.29289C13.6834 8.90237 14.3166 8.90237 14.7071 9.29289C15.0976 9.68342 15.0976 10.3166 14.7071 10.7071L13.4142 12L14.7071 13.2929C15.0976 13.6834 15.0976 14.3166 14.7071 14.7071C14.3166 15.0976 13.6834 15.0976 13.2929 14.7071L12 13.4142L10.7071 14.7071C10.3166 15.0976 9.68342 15.0976 9.29289 14.7071C8.90237 14.3166 8.90237 13.6834 9.29289 13.2929L10.5858 12L9.29289 10.7071C8.90237 10.3166 8.90237 9.68342 9.29289 9.29289Z" fill="black"/></svg>';

  /**
   * See description in public component.
   */
  @Prop() iconSpinnerScreenLoading: string;

  /**
   * See description in public component.
   */
  @Prop() iconSpinnerFromGalleryExperience: string;

  /**
    * Instance of SdkService passed from root component.
    */
  @Prop() sdkService: SdkService;

  /**
   * Instance of TranslationService passed from root component.
   */
  @Prop() translationService: TranslationService;

  /**
   * Camera device ID passed from root component.
   */
  @Prop() cameraId: string | null = null;

  /**
   * See event 'fatalError' in public component.
   */
  @Event() fatalError: EventEmitter<EventFatalError>;

  /**
   * See event 'ready' in public component.
   */
  @Event() ready: EventEmitter<EventReady>;

  /**
   * See event 'scanError' in public component.
   */
  @Event() scanError: EventEmitter<EventScanError>;

  /**
   * See event 'scanSuccess' in public component.
   */
  @Event() scanSuccess: EventEmitter<EventScanSuccess>;

  /**
   * Event containing FeedbackMessage which can be passed to MbFeedback component.
   */
  @Event() feedback: EventEmitter<FeedbackMessage>;

  /**
   * See event 'cameraScanStarted' in public component.
   */
  @Event() cameraScanStarted: EventEmitter<null>;

  /**
   * See event 'imageScanStarted' in public component.
   */
  @Event() imageScanStarted: EventEmitter<null>;

  /**
   * Host element as variable for manipulation (CSS in this case)
   */
  @Element() hostEl: HTMLElement;

  /**
   * Method is exposed outside which allow us to control UI state from parent component.
   *
   * In case of state `ERROR` and if `showModalWindows` is set to `true`, modal window
   * with error message will be displayed.
   */
  @Method()
  async setUiState(state: 'ERROR' | 'LOADING' | 'NONE' | 'SUCCESS') {
    window.setTimeout(() => {
      if (this.overlays.camera.visible) {
        if (state === 'ERROR' && !this.showModalWindows) {
          this.apiProcessStatusElement.state = 'NONE';
          this.apiProcessStatusElement.visible = false;
          this.stopRecognition();
          return;
        }

        this.apiProcessStatusElement.state = state;
        this.apiProcessStatusElement.visible = true;

        if (state !== 'ERROR') {
          this.cameraExperience.classList.add('is-muted');
        }
        else {
          this.cameraExperience.classList.add('is-error');
        }

        this.cameraExperience.apiState = state;
      }
      else if (this.overlays.processing.visible) {
        if (state === 'ERROR') {
          if (this.showModalWindows) {
            this.galleryExperienceModalErrorWindow.visible = true;
          }
          else {
            this.galleryExperienceModalErrorWindow.visible = false;
            this.stopRecognition();
          }
        }
      }

      if (state === 'SUCCESS') {
        window.setTimeout(() => this.stopRecognition(), 400);
      }
    }, 400);
  }

  /**
   * Lifecycle hooks
   */
  connectedCallback() {
    this.hostEl.addEventListener('keyup', (ev: any) => {
      if (ev.key === 'Escape' || ev.code === 'Escape') {
        this.stopRecognition();
      }
    });
  }

  async componentWillRender() {
    if (!this.hideLoadingAndErrorUi) {
      this.showScreen('loading');
      this.showOverlay('');
    }
  }

  render() {
    return (
      <Host>
        <mb-screen
          id="screen-loading"
          visible={!this.hideLoadingAndErrorUi}
          ref={el => this.screens.loading = el as HTMLMbScreenElement}
        >
          <mb-spinner icon={this.iconSpinnerScreenLoading}></mb-spinner>
        </mb-screen>
        <mb-screen
          id="screen-error"
          visible={false}
          ref={el => this.screens.error = el as HTMLMbScreenElement}
        >
          <div class="icon-alert">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" fill="black" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 7C12.5523 7 13 7.44772 13 8V12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12V8C11 7.44772 11.4477 7 12 7Z" fill="black" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M11 16C11 15.4477 11.4477 15 12 15H12.01C12.5623 15 13.01 15.4477 13.01 16C13.01 16.5523 12.5623 17 12.01 17H12C11.4477 17 11 16.5523 11 16Z" fill="black" />
            </svg>
          </div>

          <p ref={el => this.errorMessage = el as HTMLParagraphElement}></p>
        </mb-screen>
        <mb-screen
          id="screen-action"
          visible={false}
          ref={el => this.screens.action = el as HTMLMbScreenElement}
        >
          <p class="action-label">{this.translationService.i('action-message').toString()}</p>
          <div class="action-buttons">
            <mb-button
              ref={el => this.scanFromCameraButton = el as HTMLMbButtonElement}
              preventDefault={true}
              visible={true}
              disabled={false}
              icon={true}
              onButtonClick={() => this.startScanFromCamera()}
              imageSrcDefault={this.iconCameraDefault}
              imageSrcActive={this.iconCameraActive}
              imageAlt="action-alt-camera"
              translationService={this.translationService}
            >
            </mb-button>
            <input
              id="scan-from-image-input"
              ref={el => this.scanFromImageInput = el as HTMLInputElement}
              type="file"
              accept="image/*"
              onChange={() => this.scanFromImageInput.value && this.startScanFromImage()} />
            <mb-button
              ref={el => this.scanFromImageButton = el as HTMLMbButtonElement}
              disabled={false}
              preventDefault={false}
              visible={true}
              icon={true}
              onButtonClick={() => this.scanFromImageInput.click()}
              imageSrcDefault={this.iconGalleryDefault}
              imageSrcActive={this.iconGalleryActive}
              imageAlt="action-alt-gallery"
              translationService={this.translationService}
            >
            </mb-button>
          </div>
        </mb-screen>
        <mb-overlay
          id="overlay-drag-and-drop"
          visible={false}
          fullscreen={true}
          ref={el => this.overlays.draganddrop = el as HTMLMbOverlayElement}
        >
          <img class="drag-and-drop-icon" src={this.iconGalleryDefault} />
          <p class="drag-and-drop-message"></p>
          <div id="drag-and-drop-zone" ref={el => this.dragAndDropZone = el as HTMLDivElement}></div>
        </mb-overlay>
        <mb-overlay
          id="overlay-gallery-experience"
          ref={el => this.overlays.processing = el as HTMLMbOverlayElement}
        >
          <mb-spinner icon={this.iconSpinnerFromGalleryExperience} size="large"></mb-spinner>
          <p>{this.translationService.i('process-image-message').toString()}</p>
          <mb-modal
            ref={el => this.galleryExperienceModalErrorWindow = el as HTMLMbModalElement}
            visible={false}
            modalTitle={this.translationService.i('feedback-scan-unsuccessful-title').toString()}
            content={this.translationService.i('feedback-scan-unsuccessful').toString()}
            onClose={() => this.closeGalleryExperienceModal()}
          >
            <div slot="actionButtons">
              <button
                class="primary modal-action-button"
                onClick={() => this.closeGalleryExperienceModal()}
              >{this.translationService.i('modal-window-close').toString()}</button>
            </div>
          </mb-modal>
        </mb-overlay>
        <mb-overlay
          id="overlay-camera-experience"
          visible={false}
          ref={el => this.overlays.camera = el as HTMLMbOverlayElement}
        >
          <div class="holder">
            <video
              ref={el => this.videoElement = el as HTMLVideoElement}
              playsinline
            ></video>
            <mb-camera-experience
              ref={el => this.cameraExperience = el as HTMLMbCameraExperienceElement}
              translationService={this.translationService}
              showScanningLine={this.showScanningLine}
              onClose={() => this.stopRecognition()}
              onFlipCameraAction={() => this.flipCameraAction()}
              class="overlay-camera-element"
            ></mb-camera-experience>
            <mb-api-process-status
              ref={el => this.apiProcessStatusElement = el as HTMLMbApiProcessStatusElement}
              translationService={this.translationService}
              onCloseTryAgain={() => this.closeApiProcessStatus(true)}
              onCloseFromStart={() => this.stopRecognition()}
            ></mb-api-process-status>
          </div>
        </mb-overlay>
        <mb-overlay
          id="overlay-modal"
          visible={false}
          ref={el => this.overlays.modal = el as HTMLMbOverlayElement}
        >
          <mb-modal
            ref={el => this.licenseExperienceModal = el as HTMLMbModalElement}
            modalTitle="Error"
          >
            <div slot="actionButtons">
              <button
                class="primary modal-action-button"
                onClick={() => this.showOverlay('')}
              >this.translationService.i('modal-window-close').toString()</button>
            </div>
          </mb-modal>
        </mb-overlay>
      </Host>
    );
  }

  async closeApiProcessStatus(restart: boolean = false): Promise<void> {
    window.setTimeout(() => {
      this.apiProcessStatusElement.visible = false;
      this.apiProcessStatusElement.state = 'NONE';
      this.cameraExperience.classList.remove('is-muted');
      this.cameraExperience.classList.remove('is-error');
    }, 600);

    if (restart) {
      await this.checkInputProperties()
        .then(() => this.sdkService.resumeRecognition())
        .then(() => {
          window.setTimeout(() => this.cameraExperience.apiState = '', 400);
          this.isBackSide = false;
          this.cameraExperience.setState(CameraExperienceState.Default, this.isBackSide, true);
        });
    }
  }

  async componentDidRender() {
    const internetIsAvailable = await this.checkIfInternetIsAvailable();
    if (!internetIsAvailable) {
      this.setFatalError(
        new EventFatalError(
          Code.InternetNotAvailable,
          this.translationService.i('check-internet-connection').toString()
        )
      );
      return;
    }

    const hasMandatoryProperties = await this.checkInputProperties();

    if (!hasMandatoryProperties) {
      return;
    }

    const hasMandatoryCapabilities = await DeviceHelpers.checkMandatoryCapabilites();

    if (!hasMandatoryCapabilities) {
      this.setFatalError(new EventFatalError(Code.BrowserNotSupported, 'Browser is not supported!'));
      return;
    }

    const initEvent: EventReady | EventFatalError = await this.sdkService.initialize(this.licenseKey, {
      allowHelloMessage: this.allowHelloMessage,
      engineLocation: this.engineLocation
    });

    this.cameraExperience.showOverlay = this.sdkService.showOverlay;

    if (initEvent instanceof EventFatalError) {
      this.setFatalError(initEvent);
      return;
    }

    if (this.showActionLabels) {
      this.scanFromCameraButton.label = this.translationService.i('action-message-camera').toString();
      this.scanFromImageButton.label = this.translationService.i('action-message-image').toString();
    }

    if (this.scanFromCamera) {
      this.scanFromCameraButton.visible = true;

      const hasVideoDevices = await DeviceHelpers.hasVideoDevices();

      this.scanFromCameraButton.disabled = !hasVideoDevices;

      if (!hasVideoDevices) {
        this.feedback.emit({
          code: FeedbackCode.CameraDisabled,
          state: 'FEEDBACK_INFO',
          message: this.translationService.i('camera-disabled').toString()
        });

        if (this.showActionLabels) {
          this.scanFromCameraButton.label = this.translationService.i('action-message-camera-disabled').toString();
        }
      }
    }

    if (this.scanFromImage) {
      this.scanFromImageButton.visible = true;

      const imageScanIsAvailable = this.sdkService.isScanFromImageAvailable(this.recognizers, this.recognizerOptions);
      this.scanFromImageButton.disabled = !imageScanIsAvailable;

      if (!imageScanIsAvailable) {
        if (this.showActionLabels) {
          this.scanFromImageButton.label = this.translationService.i('action-message-image-not-supported').toString();
        }
      }
    }

    this.ready.emit(initEvent);

    this.showScreen('action');

    if (this.enableDrag) {
      this.setDragAndDrop();
    }
  }

  /**
   * Private methods and properties
   */

  /* Element references */
  private screens: { [key: string]: HTMLMbScreenElement | null } = {
    action: null,
    error: null,
    loading: null
  }

  private overlays: { [key: string]: HTMLMbOverlayElement | null } = {
    camera: null,
    draganddrop: null,
    processing: null,
    modal: null
  }

  private cameraExperience!: HTMLMbCameraExperienceElement;
  private dragAndDropZone!: HTMLDivElement;
  private errorMessage!: HTMLParagraphElement;
  private scanFromCameraButton!: HTMLMbButtonElement;
  private scanFromImageButton!: HTMLMbButtonElement;
  private scanFromImageInput!: HTMLInputElement;
  private videoElement!: HTMLVideoElement;
  private licenseExperienceModal!: HTMLMbModalElement;
  private apiProcessStatusElement!: HTMLMbApiProcessStatusElement;
  private galleryExperienceModalErrorWindow: HTMLMbModalElement;
  private scanReset: boolean = false;

  private detectionSuccessLock = false;
  private isBackSide = false;

  private initialBodyOverflowValue: string;

  private async flipCameraAction(): Promise<void> {
    await this.sdkService.flipCamera();
    const cameraFlipped = await this.sdkService.isCameraFlipped();
    this.cameraExperience.setCameraFlipState(cameraFlipped);
  }

  /* Helper methods */
  private async checkInputProperties(): Promise<boolean> {
    if (!this.licenseKey) {
      this.setFatalError(new EventFatalError(Code.MissingLicenseKey, 'Missing license key!'));
      return false;
    }

    // Recognizers
    const conclusion: CheckConclusion = this.sdkService.checkRecognizers(this.recognizers);

    if (!conclusion.status) {
      const fatalError = new EventFatalError(
        Code.InvalidRecognizers,
        conclusion.message
      );

      this.setFatalError(fatalError);
      return false;
    }

    this.cameraExperience.type = this.sdkService.getDesiredCameraExperience(this.recognizers, this.recognizerOptions);

    // Recognizer options
    if (this.recognizerOptions && this.recognizerOptions.length) {
      const conclusion: CheckConclusion = this.sdkService.checkRecognizerOptions(
        this.recognizers,
        this.recognizerOptions
      );

      if (!conclusion.status) {
        const fatalError = new EventFatalError(
          Code.InvalidRecognizerOptions,
          conclusion.message
        );

        this.setFatalError(fatalError);
        return false;
      }
    }

    return true;
  }

  private async checkIfInternetIsAvailable(): Promise<boolean> {
    return navigator.onLine ? true : false;
  }

  private async startScanFromCamera() {
    const configuration: VideoRecognitionConfiguration = {
      recognizers: this.recognizers,
      successFrame: this.includeSuccessFrame,
      cameraFeed: this.videoElement,
      cameraId: this.cameraId
    };

    if (this.recognizerOptions && this.recognizerOptions.length) {
      configuration.recognizerOptions = this.recognizerOptions;
    }

    this.isBackSide = false;

    const eventHandler = (recognitionEvent: RecognitionEvent) => {
      switch (recognitionEvent.status) {
        case RecognitionStatus.Preparing:
          this.showOverlay('camera');
          this.cameraExperience.setState(CameraExperienceState.Default);
          break;

        case RecognitionStatus.Processing:
          // Just keep working
          break;

        case RecognitionStatus.EmptyResultState:
          if (!recognitionEvent.data.initiatedByUser) {
            this.scanError.emit({
              code: Code.EmptyResult,
              fatal: true,
              message: 'Could not extract information from video feed!',
              recognizerName: recognitionEvent.data.recognizerName
            });
            this.feedback.emit({
              code: FeedbackCode.ScanUnsuccessful,
              state: 'FEEDBACK_ERROR',
              message: this.translationService.i('feedback-scan-unsuccessful').toString()
            });
          }
          this.showOverlay('');
          break;

        case RecognitionStatus.UnknownError:
          // Do nothing, RecognitionStatus.EmptyResultState will handle negative outcome
          break;

        case RecognitionStatus.DetectionFailed:
          this.cameraExperience.setState(CameraExperienceState.Default, this.isBackSide);
          this.detectionSuccessLock = false;
          break;

        case RecognitionStatus.DetectionStatusChange:
          // Use this event if information about card location is required
          break;

        case RecognitionStatus.DetectionStatusFail:
          this.cameraExperience.setState(CameraExperienceState.Default, this.isBackSide);
          break;

        case RecognitionStatus.DetectionStatusSuccess:
          this.detectionSuccessLock = true;
          window.setTimeout(() => {
            if (this.detectionSuccessLock) {
              this.cameraExperience.setState(CameraExperienceState.Detection);
              this.scanReset = false;
            }
          }, 100);
          break;

        case RecognitionStatus.DetectionStatusCameraTooHigh:
          this.cameraExperience.setState(CameraExperienceState.MoveCloser)
            .then(() => {
              this.cameraExperience.setState(CameraExperienceState.Default, this.isBackSide);
            });
          break;

        case RecognitionStatus.DetectionStatusCameraAtAngle:
          this.cameraExperience.setState(CameraExperienceState.AdjustAngle)
            .then(() => {
              this.cameraExperience.setState(CameraExperienceState.Default, this.isBackSide);
            });
          break;

        case RecognitionStatus.DetectionStatusCameraTooNear:
        case RecognitionStatus.DetectionStatusDocumentTooCloseToEdge:
        case RecognitionStatus.DetectionStatusPartial:
          this.cameraExperience.setState(CameraExperienceState.MoveFarther)
            .then(() => {
              this.cameraExperience.setState(CameraExperienceState.Default, this.isBackSide);
            });
          break;

        case RecognitionStatus.DocumentClassified:
          this.cameraExperience.setState(CameraExperienceState.Classification);
          break;

        case RecognitionStatus.OnFirstSideResult:
          this.cameraExperience.setState(CameraExperienceState.Done, false, true)
            .then(() => {
              this.cameraExperience.setState(CameraExperienceState.Flip, this.isBackSide, true)
                .then(() => {
                  if (!this.scanReset) {
                    this.isBackSide = true;
                    this.cameraExperience.setState(
                      CameraExperienceState.Default,
                      this.isBackSide
                    );
                  }
                });
            })
          break;

        case RecognitionStatus.ScanSuccessful:
          // Which recognizer is it? ImageCapture or some other?
          // Image capture has the 'imageCapture' flag set to true, we do not want to close camera overlay after image acquisition process is finished
          // Cause maybe backend service will failed and we can press retry to resume with the same video recognizer and try again
          if (!recognitionEvent.data.imageCapture) {
            this.cameraExperience.setState(CameraExperienceState.DoneAll, false, true)
              .then(() => {
                this.cameraExperience.classList.add('hide');

                this.showOverlay('');

              window.setTimeout(() => {
                this.cameraExperience.setState(CameraExperienceState.Default);
              }, 1000);

              this.scanSuccess.emit(recognitionEvent.data?.result);
              this.feedback.emit({
                code: FeedbackCode.ScanSuccessful,
                state: 'FEEDBACK_OK',
                message: ''
              });
            });
          }
          else {
            const resultIsValid = recognitionEvent.data.result.recognizer.processingStatus === 0 && recognitionEvent.data.result.recognizer.state === 2;

            if (resultIsValid) {
              this.scanSuccess.emit(recognitionEvent.data?.result);
              this.feedback.emit({
                code: FeedbackCode.ScanSuccessful,
                state: 'FEEDBACK_OK',
                message: ''
              });
            }
            else if (!recognitionEvent.data.initiatedByUser) {
              this.scanError.emit({
                code: Code.EmptyResult,
                fatal: true,
                message: 'Could not extract information from video feed!',
                recognizerName: recognitionEvent.data.recognizerName
              });
            }
          }
          break;

        case RecognitionStatus.CameraNotAllowed:
          this.scanError.emit({
            code: Code.CameraNotAllowed,
            fatal: true,
            message: 'Cannot access camera!',
            recognizerName: ''
          });
          this.feedback.emit({
            code: FeedbackCode.CameraNotAllowed,
            state: 'FEEDBACK_ERROR',
            message: this.translationService.i('camera-not-allowed').toString()
          });
          window.setTimeout(() => {
            this.scanFromCameraButton.disabled = true;
            if (this.showActionLabels) {
              this.scanFromCameraButton.label = this.translationService.i('action-message-camera-not-allowed').toString();
            }
          }, 10);
          this.showOverlay('');
          break;

        case RecognitionStatus.CameraInUse:
          this.scanError.emit({
            code: Code.CameraInUse,
            fatal: true,
            message: 'Camera already in use!',
            recognizerName: ''
          });
          this.feedback.emit({
            code: FeedbackCode.CameraInUse,
            state: 'FEEDBACK_ERROR',
            message: this.translationService.i('camera-in-use').toString()
          });

          window.setTimeout(() => {
            this.scanFromCameraButton.disabled = true;
            if (this.showActionLabels) {
              this.scanFromCameraButton.label = this.translationService.i('action-message-camera-in-use').toString();
            }
          }, 10);
          this.showOverlay('');
          break;

        case RecognitionStatus.NoSupportForMediaDevices:
        case RecognitionStatus.CameraNotFound:
        case RecognitionStatus.UnableToAccessCamera:
          this.scanError.emit({
            code: Code.CameraGenericError,
            fatal: true,
            message: `There was a problem while accessing camera ${recognitionEvent.status}`,
            recognizerName: ''
          });
          this.feedback.emit({
            code: FeedbackCode.CameraGenericError,
            state: 'FEEDBACK_ERROR',
            message: this.translationService.i('camera-generic-error').toString()
          });
          window.setTimeout(() => {
            this.scanFromCameraButton.disabled = true;
            if (this.showActionLabels) {
              this.scanFromCameraButton.label = this.translationService.i('action-message-camera-disabled').toString();
            }
          }, 10);
          this.showOverlay('');
          break;

        default:
        // console.warn('Unhandled video recognition status:', recognitionEvent.status);
      }
    };

    try {
      this.cameraExperience.classList.remove('hide');
      this.cameraScanStarted.emit();
      await this.sdkService.scanFromCamera(configuration, eventHandler);

      const cameraFlipped = this.sdkService.isCameraFlipped();
      this.cameraExperience.setCameraFlipState(cameraFlipped);
    } catch (error) {
      this.checkIfInternetIsAvailable()
        .then((isAvailable) => {
          if (isAvailable) {
            if (error?.code === 'UNLOCK_LICENSE_ERROR' ) {
              this.setFatalError(new EventFatalError(Code.LicenseError, 'Something is wrong with the license.', error));
              this.showLicenseInfoModal(error);
            }
            else {
              console.log("error", error);

              this.scanError.emit({
                code: Code.GenericScanError,
                fatal: true,
                message: `There was a problem during scan action.`,
                recognizerName: ''
              });
              this.feedback.emit({
                code: FeedbackCode.GenericScanError,
                state: 'FEEDBACK_ERROR',
                message: this.translationService.i('feedback-error-generic').toString()
              });

              this.showOverlay('');
            }
          }
          else {
            this.setFatalError(new EventFatalError(Code.InternetNotAvailable, this.translationService.i('check-internet-connection').toString()));
            this.showLicenseInfoModal(this.translationService.i('check-internet-connection').toString());
          }
        });
    }
  }

  private async startScanFromImage(files?: FileList) {
    const configuration: ImageRecognitionConfiguration = {
      recognizers: this.recognizers,
      fileList: files ? files : this.scanFromImageInput.files
    };

    if (this.recognizerOptions && this.recognizerOptions.length) {
      configuration.recognizerOptions = this.recognizerOptions;
    }

    const eventHandler = (recognitionEvent: RecognitionEvent) => {
      switch (recognitionEvent.status) {
        case RecognitionStatus.Preparing:
          this.showOverlay('processing');
          break;

        case RecognitionStatus.Processing:
          // Just keep working
          break;

        case RecognitionStatus.NoImageFileFound:
          this.scanError.emit({
            code: Code.NoImageFileFound,
            fatal: true,
            message: 'No image file was provided to SDK service!',
            recognizerName: ''
          });
          this.feedback.emit({
            code: FeedbackCode.ScanUnsuccessful,
            state: 'FEEDBACK_ERROR',
            message: this.translationService.i('feedback-scan-unsuccessful').toString()
          });
          this.showOverlay('');
          this.scanFromImageInput.value = '';
          break;

        case RecognitionStatus.DetectionFailed:
          // Do nothing, RecognitionStatus.EmptyResultState will handle negative outcome
          this.scanFromImageInput.value = '';
          break;

        case RecognitionStatus.EmptyResultState:
          this.scanError.emit({
            code: Code.EmptyResult,
            fatal: true,
            message: 'Could not extract information from image!',
            recognizerName: recognitionEvent.data.recognizerName
          });
          this.feedback.emit({
            code: FeedbackCode.ScanUnsuccessful,
            state: 'FEEDBACK_ERROR',
            message: this.translationService.i('feedback-scan-unsuccessful').toString()
          });
          this.showOverlay('');
          this.scanFromImageInput.value = '';
          break;

        case RecognitionStatus.UnknownError:
          // Do nothing, RecognitionStatus.EmptyResultState will handle negative outcome
          this.scanFromImageInput.value = '';
          break;

        case RecognitionStatus.ScanSuccessful:
          this.scanSuccess.emit(recognitionEvent.data);
          this.feedback.emit({
            code: FeedbackCode.ScanSuccessful,
            state: 'FEEDBACK_OK',
            message: ''
          });
          this.scanFromImageInput.value = '';

          if (!recognitionEvent.data.imageCapture) {
            this.showOverlay('');
          }
          break;

        default:
        //console.warn('Unhandled image recognition status:', recognitionEvent.status);
      }
    };

    try {
      this.imageScanStarted.emit();

      if (this.thoroughScanFromImage) {
        configuration.thoroughScan = true;
      }

      await this.sdkService.scanFromImage(configuration, eventHandler);
    } catch (error) {
      this.checkIfInternetIsAvailable()
        .then((isAvailable) => {
          if (isAvailable) {
            if (error?.code === 'UNLOCK_LICENSE_ERROR' ) {
              this.setFatalError(new EventFatalError(Code.LicenseError, 'Something is wrong with the license.', error));
              this.showLicenseInfoModal(error);
            }
            else {
              this.scanError.emit({
                code: Code.GenericScanError,
                fatal: true,
                message: `There was a problem during scan action.`,
                recognizerName: ''
              });
              this.feedback.emit({
                code: FeedbackCode.GenericScanError,
                state: 'FEEDBACK_ERROR',
                message: this.translationService.i('feedback-error-generic').toString()
              });

              this.showOverlay('');
            }
          }
          else {
            this.setFatalError(new EventFatalError(Code.InternetNotAvailable, this.translationService.i('check-internet-connection').toString()));
            this.showLicenseInfoModal(this.translationService.i('check-internet-connection').toString());
          }
        });
    }
  }

  private showLicenseInfoModal(error: any): void {
    if (typeof error === 'string') {
      this.licenseExperienceModal.content = error;
    }
    else {
      if (error.type === 'NETWORK_ERROR') {
        this.licenseExperienceModal.content = this.translationService.i('network-error').toString();
      }
      else {
        this.licenseExperienceModal.content = this.translationService.i('scanning-not-available').toString();
      }
    }

    this.showOverlay('modal');
  }

  private showScreen(screenName: string) {
    for (const screenKey in this.screens) {
      if (this.screens[screenKey]) {
        this.screens[screenKey].visible = screenName === screenKey;
      }
    }
  }

  private showOverlay(overlayName: string) {
    if (overlayName === 'camera') {
      this.initialBodyOverflowValue = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = this.initialBodyOverflowValue;
    }

    for (const overlayKey in this.overlays) {
      if (this.overlays[overlayKey]) {
        this.overlays[overlayKey].visible = overlayName === overlayKey;
      }
    }
  }

  private setDragAndDrop() {
    this.overlays.draganddrop.classList.remove('non-fullscreen');

    const lockTimeout = 3000;
    let lockDragAndDrop = false;

    const closeOverlay = () => {
      if (lockDragAndDrop) {
        window.setTimeout(() => {
          this.showOverlay('');

          window.setTimeout(() => {
            this.showScreen('action');
            this.hostEl.style.borderStyle = 'solid';
          }, 500);
        }, lockTimeout);
      } else {
        this.showOverlay('');
        window.setTimeout(() => {
          this.showScreen('action');
          this.hostEl.style.borderStyle = 'solid';
        }, 500);
      }
    }

    window.addEventListener('dragenter', (ev: any) => {
      ev.stopPropagation();
      ev.preventDefault();

      if (!this.scanFromImageButton.visible) {
        return;
      }

      this.showScreen('');
      this.hostEl.style.borderStyle = 'none';
    });

    window.addEventListener('dragover', (ev: any) => {
      ev.stopPropagation();
      ev.preventDefault();

      if (!this.scanFromImageButton.visible) {
        return;
      }

      this.showScreen('');
      this.hostEl.style.borderStyle = 'none';

      this.overlays.draganddrop.classList.remove('error');
      this.overlays.draganddrop.querySelector('p').innerText = this.translationService.i('drop-info').toString();

      this.showOverlay('draganddrop');
    });

    this.dragAndDropZone.addEventListener('dragleave', (ev: any) => {
      ev.stopPropagation();
      ev.preventDefault();

      if (!this.scanFromImageButton.visible) {
        return;
      }

      closeOverlay();
    });

    this.dragAndDropZone.addEventListener('drop', (ev: any) => {
      ev.stopPropagation();
      ev.preventDefault();

      if (!this.scanFromImageButton.visible) {
        return;
      }

      if (GenericHelpers.hasSupportedImageFiles(ev.dataTransfer.files)) {
        this.startScanFromImage(ev.dataTransfer.files);
      } else {
        this.overlays.draganddrop.classList.add('error');
        this.overlays.draganddrop.querySelector('p').innerText = this.translationService.i('drop-error').toString();

        lockDragAndDrop = true;
        window.setTimeout(() => lockDragAndDrop = false, lockTimeout);
      }

      closeOverlay();
    });
  }

  private setFatalError(error: EventFatalError) {
    this.fatalError.emit(error);

    if (this.hideLoadingAndErrorUi) {
      return;
    }

    if (error.details) {
      switch (error.details?.code) {
        case 'UNLOCK_LICENSE_ERROR':
          const licenseErrorType = error.details?.type;
          switch (licenseErrorType) {
            case 'NETWORK_ERROR':
              this.errorMessage.innerText = this.translationService.i('network-error').toString();
              break;
            default:
              this.errorMessage.innerText = this.translationService.i('scanning-not-available').toString();
          }
          break;
      }
    }
    else {
      this.errorMessage.innerText = error.message;
    }

    this.showScreen('error');
    this.showOverlay('');
  }

  private stopRecognition() {
    this.cameraExperience.classList.add('hide');

    this.sdkService.stopRecognition();
    this.scanReset = true;

    window.setTimeout(() => {
      this.cameraExperience.setState(CameraExperienceState.Default, false, true);
      this.cameraExperience.apiState = '';
    }, 500);

    this.showOverlay('');
    this.closeApiProcessStatus();
  }

  private closeGalleryExperienceModal() {
    this.galleryExperienceModalErrorWindow.visible = false;
    this.stopRecognition();
  }
}
