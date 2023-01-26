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
  Method,
  Prop,
  State,
  Watch
} from '@stencil/core';

import {
  CameraEntry,
  CameraExperience,
  CameraExperienceState,
  CameraExperienceStateDuration,
  CameraExperienceTimeoutDurations
} from '../../../utils/data-structures';

import { setWebComponentParts, classNames, getWebComponentParts } from '../../../utils/generic.helpers';

import { TranslationService } from '../../../utils/translation.service';

import * as Utils from './mb-camera-experience.utils';

@Component({
  tag: 'mb-camera-experience',
  styleUrl: 'mb-camera-experience.scss',
  shadow: true,
})
export class MbCameraExperience {
  @State() cameraCursorBarcodeClassName: string = 'rectangle';

  @State() cameraCursorIdentityCardClassName: string = 'reticle';

  @State() cameraCursorPaymentCardClassName: string = 'rectangle';

  @State() scanningLineBarcodeClassName: string;

  @State() scanningLinePaymentCardClassName: string;

  @State() cameraMessageIdentityCardContent: any;

  @State() cameraMessageIdentityCardClassName: string = 'message';

  private cameraMessageIdentityCard!: HTMLParagraphElement;
  private cameraMessagePaymentCard!: HTMLParagraphElement;
  private cameraMessageBarcode!: HTMLParagraphElement;
  private cameraToolbar!: HTMLMbCameraToolbarElement;
  private cardIdentityElement!: HTMLDivElement;

  private cameraStateChangeId: number = 0;
  private cameraStateInProgress: boolean = false;
  private flipCameraStateInProgress: boolean = false;
  private barcodeScanningInProgress: boolean = false;

  /**
   * Choose desired camera experience.
   *
   * Each experience type must be implemented in this component.
   */
  @Prop() type: CameraExperience;

  /**
   * Configure camera experience state timeout durations
   */
  @Prop() cameraExperienceStateDurations: CameraExperienceTimeoutDurations = null;

  /**
   * Unless specifically granted by your license key, you are not allowed to
   * modify or remove the Microblink logo displayed on the bottom of the camera
   * overlay.
   */
  @Prop() showOverlay: boolean = true;

  /**
   * Instance of TranslationService passed from root component.
   */
  @Prop() translationService: TranslationService;

  /**
   * Api state passed from root component.
   */
  @Prop() apiState: string;

  /**
   * Camera horizontal state passed from root component.
   *
   * Horizontal camera image can be mirrored
   */
  @Prop({ mutable: true }) cameraFlipped: boolean = false;

  /**
   * Show scanning line on camera
   */
  @Prop() showScanningLine: boolean = false;

  /**
   * Show camera feedback message on camera for Barcode scanning
   */
  @Prop() showCameraFeedbackBarcodeMessage: boolean = false;

  @Prop() clearIsCameraActive: boolean = false;

  @Watch('apiState')
  apiStateHandler(apiState: string, _oldValue: string) {
    if (apiState === '' && (this.type === CameraExperience.CardSingleSide || this.type === CameraExperience.CardMultiSide))
      this.cardIdentityElement.classList.add('visible');
    else
      this.cardIdentityElement.classList.remove('visible');
  }

  /**
   * Emitted when user clicks on 'X' button.
   */
  @Event() close: EventEmitter<void>;

  /**
   * Emitted when camera stream becomes active.
   */
  @Event() setIsCameraActive: EventEmitter<boolean>;

  /**
   * Emitted when user selects a different camera device.
   */
  @Event() changeCameraDevice: EventEmitter<CameraEntry>;

  /**
   * Host element as variable for manipulation
   */
  @Element() hostEl: HTMLElement;

  /**
   * Change active camera.
   */
  @Method()
  async setActiveCamera(cameraId: string) {
    this.cameraToolbar.setActiveCamera(cameraId);
  }

  /**
   * Populate list of camera devices.
   */
  @Method()
  async populateCameraDevices() {
    await this.cameraToolbar.populateCameraDevices();
  }

  /**
   * Emitted when user clicks on Flip button.
   */
  @Event() flipCameraAction: EventEmitter<void>;

  /**
   * Method is exposed outside which allow us to control Camera Flip state from parent component.
   */
  @Method()
  async setCameraFlipState(isFlipped: boolean) {
    this.cameraFlipped = isFlipped;
  }

  /**
   * Set camera state which includes animation and message.
   */
  @Method()
  setState(state: CameraExperienceState, isBackSide: boolean = false, force: boolean = false): Promise<void> {
    return new Promise((resolve) => {
      if (!force && (!state || this.cameraStateInProgress || this.flipCameraStateInProgress)) {
        resolve();
        return;
      }

      if (state === CameraExperienceState.BarcodeScanning) {
        this.barcodeScanningInProgress = true;
      }

      this.cameraStateInProgress = true;
      let cameraStateChangeId = this.cameraStateChangeId + 1;
      this.cameraStateChangeId = cameraStateChangeId;

      if (state === CameraExperienceState.Flip) {
        this.flipCameraStateInProgress = true;
      }

      const stateClass = Utils.getStateClass(state);

      switch (this.type) {
        case CameraExperience.CardSingleSide:
        case CameraExperience.CardMultiSide:
          this.cameraCursorIdentityCardClassName = `reticle ${stateClass}`;
          break;
        case CameraExperience.Barcode:
          stateClass === 'is-detection' && this.showScanningLine ? this.scanningLineBarcodeClassName = 'is-active' : this.scanningLineBarcodeClassName = '';
          this.cameraCursorBarcodeClassName = `rectangle ${stateClass}`;
          break;
          case CameraExperience.PaymentCard:
            stateClass === 'is-default' && this.showScanningLine ? this.scanningLinePaymentCardClassName = 'is-active' : this.scanningLinePaymentCardClassName = '';
            this.cameraCursorPaymentCardClassName = `rectangle ${stateClass}`;
          break;
      }

      this.setMessage(state, isBackSide, this.type);

      window.setTimeout(() => {
        if (this.flipCameraStateInProgress && state === CameraExperienceState.Flip) {
          this.flipCameraStateInProgress = false;
        }
        if (this.cameraStateChangeId === cameraStateChangeId) {
          this.cameraStateInProgress = false;
        }
        resolve();
      }, this.getCameraExperienceStateDuration(state));
    });
  }

  private getCameraExperienceStateDuration(state: CameraExperienceState): number {
    return this.cameraExperienceStateDurations ? this.getStateDurationFromUserInput(state) : CameraExperienceStateDuration.get(state);
  }

  private getStateDurationFromUserInput(state: CameraExperienceState): number {
    const cameraExperienceStateDurationMap = new Map(Object.entries(this.cameraExperienceStateDurations));
    const stateAdjusted = state[0].toLocaleLowerCase() + state.slice(1);
    
    const duration = cameraExperienceStateDurationMap.get(stateAdjusted);

    return duration || CameraExperienceStateDuration.get(state);
  }

  /**
   * Set camera state to initial method.
   */
  @Method()
  resetState(): Promise<void> {
    return new Promise((resolve) => {
      // Reset flags
      this.cameraStateChangeId = 0;

      this.cameraStateInProgress = false;
      this.flipCameraStateInProgress = false;
      this.barcodeScanningInProgress = false;

      // Reset DOM
      while (this.cameraMessageIdentityCard.firstChild) {
        this.cameraMessageIdentityCard.removeChild(this.cameraMessageIdentityCard.firstChild);
      }

      while (this.cameraMessagePaymentCard.firstChild) {
        this.cameraMessagePaymentCard.removeChild(this.cameraMessagePaymentCard.firstChild);
      }

      while (this.cameraMessageBarcode.firstChild) {
        this.cameraMessageBarcode.removeChild(this.cameraMessageBarcode.firstChild);
      }

      resolve();
    });
  }

  private flipCamera(): void {
    this.flipCameraAction.emit();
  }

  private handleStop() {
    this.close.emit();
  }

  private setMessage(state: CameraExperienceState, isBackSide: boolean, type: CameraExperience): void {
    const message = this.getStateMessage(state, isBackSide, type);

    switch (type) {
      case CameraExperience.CardSingleSide:
      case CameraExperience.CardMultiSide:
        while (this.cameraMessageIdentityCard.firstChild) {
          this.cameraMessageIdentityCard.removeChild(this.cameraMessageIdentityCard.firstChild);
        }

        if (message) {
          this.cameraMessageIdentityCard.appendChild(message);
        }

        this.cameraMessageIdentityCardClassName = message && message !== null ? 'message is-active' : 'message';
        break;
      case CameraExperience.PaymentCard:
        while (this.cameraMessagePaymentCard.firstChild) {
          this.cameraMessagePaymentCard.removeChild(this.cameraMessagePaymentCard.firstChild);
        }

        if (message) {
          this.cameraMessagePaymentCard.appendChild(message);
        }

        this.cameraMessagePaymentCard.setAttribute('class', message && message !== null ? 'message is-active' : 'message');
        break;
      case CameraExperience.Barcode:
        while (this.cameraMessageBarcode.firstChild) {
          this.cameraMessageBarcode.removeChild(this.cameraMessageBarcode.firstChild);
        }

        if (this.showCameraFeedbackBarcodeMessage) {
          if (message) {
            this.cameraMessageBarcode.appendChild(message);
          }

          this.cameraMessageBarcode.setAttribute('class', message && message !== null ? 'message is-active' : 'message');
        }
        break;
      default:
        // Do nothing
    }
  }

  private getStateMessage(state: CameraExperienceState, isBackSide: boolean = false, type: CameraExperience): HTMLSpanElement|null {
    const getStateMessageAsHTML = (message: string|Array<string>): HTMLSpanElement => {
      if (message) {
        const messageArray = typeof message === 'string' ? [ message ] : message;
        const children = [];

        while (messageArray.length) {
          const sentence = messageArray.shift();
          children.push(document.createTextNode(sentence));

          if (messageArray.length) {
            children.push(document.createElement('br'));
          }
        }

        const spanElement = document.createElement('span');

        while (children.length) {
          spanElement.appendChild(children.shift());
        }

        return spanElement;
      }
    }

    switch (state) {
      case CameraExperienceState.Default:
        if (type === CameraExperience.Barcode && this.showCameraFeedbackBarcodeMessage) {
          return getStateMessageAsHTML(this.translationService.i('camera-feedback-barcode-message'));
        }
        const key = isBackSide ? 'camera-feedback-scan-back' : 'camera-feedback-scan-front';
        if (this.barcodeScanningInProgress) {
          return getStateMessageAsHTML(this.translationService.i('camera-feedback-barcode'));
        }

        return getStateMessageAsHTML(this.translationService.i(key));

      case CameraExperienceState.MoveFarther:
        return getStateMessageAsHTML(this.translationService.i('camera-feedback-move-farther'));

      case CameraExperienceState.MoveCloser:
        return getStateMessageAsHTML(this.translationService.i('camera-feedback-move-closer'));

      case CameraExperienceState.AdjustAngle:
        return getStateMessageAsHTML(this.translationService.i('camera-feedback-adjust-angle'));

      case CameraExperienceState.Flip:
        return getStateMessageAsHTML(this.translationService.i('camera-feedback-flip'));

      case CameraExperienceState.BarcodeScanning:
        return getStateMessageAsHTML(this.translationService.i('camera-feedback-barcode'));

      case CameraExperienceState.Classification:
      case CameraExperienceState.Detection:
          return type === CameraExperience.Barcode ? getStateMessageAsHTML(this.translationService.i('camera-feedback-barcode-message')) : null;
      case CameraExperienceState.Done:
      case CameraExperienceState.DoneAll:
      default:
        return null;
    }
  }

  private handleChangeCameraDevice(camera: CameraEntry) {
    this.changeCameraDevice.emit(camera);
  }

  componentDidLoad() {
    setWebComponentParts(this.hostEl);
    const parts = getWebComponentParts(this.hostEl.shadowRoot);
    this.hostEl.setAttribute('exportparts', parts.join(', '));
  }

  render() {
    return (
      <Host class={ classNames({ 'no-overlay': !this.showOverlay }) }>
        {/* Barcode camera experience */}
        <div id="barcode" class={ classNames({ visible: this.type === CameraExperience.Barcode }) }>
          <div class="rectangle-container">
            <div class={ this.cameraCursorBarcodeClassName }>
              <div class="rectangle__cursor">
                <div class="rectangle__el"></div>
                <div class="rectangle__el"></div>
                <div class="rectangle__el"></div>
                <div class="rectangle__el"></div>

                <div class={ `scanning-line ${this.scanningLineBarcodeClassName}` }></div>
              </div>
            </div>
            <p class="message" ref={ el => this.cameraMessageBarcode = el as HTMLParagraphElement }></p>
          </div>
        </div>

        {/* Identity card camera experience */}
        <div id="card-identity" ref={(el) => this.cardIdentityElement = el as HTMLDivElement} class={ classNames({ visible: this.type === CameraExperience.CardSingleSide || this.type === CameraExperience.CardMultiSide }) }>
          <div class="reticle-container">
            <div class={ this.cameraCursorIdentityCardClassName }>
              <div class="reticle__cursor">
                <div class="reticle__el"></div>
                <div class="reticle__el"></div>
                <div class="reticle__el"></div>
                <div class="reticle__el"></div>
              </div>
              <img class="reticle__done" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwLjk3MiAzMy40NkMyMC43MDk1IDMzLjQ2MDUgMjAuNDQ5NCAzMy40MDkyIDIwLjIwNjggMzMuMzA5QzE5Ljk2NDEgMzMuMjA4OCAxOS43NDM2IDMzLjA2MTYgMTkuNTU4IDMyLjg3NkwxMS4wNzQgMjQuMzlDMTAuODgyOSAyNC4yMDU2IDEwLjczMDMgMjMuOTg1MSAxMC42MjU0IDIzLjc0MTFDMTAuNTIwNCAyMy40OTcyIDEwLjQ2NSAyMy4yMzQ4IDEwLjQ2MjUgMjIuOTY5MkMxMC40NiAyMi43MDM3IDEwLjUxMDQgMjIuNDQwMyAxMC42MTA4IDIyLjE5NDRDMTAuNzExMiAyMS45NDg2IDEwLjg1OTYgMjEuNzI1MiAxMS4wNDcyIDIxLjUzNzNDMTEuMjM0OSAyMS4zNDkzIDExLjQ1ODEgMjEuMjAwNyAxMS43MDM4IDIxLjA5OTlDMTEuOTQ5NSAyMC45OTkyIDEyLjIxMjggMjAuOTQ4NCAxMi40Nzg0IDIwLjk1MDVDMTIuNzQzOSAyMC45NTI2IDEzLjAwNjQgMjEuMDA3NiAxMy4yNTA1IDIxLjExMjNDMTMuNDk0NiAyMS4yMTY5IDEzLjcxNTQgMjEuMzY5MSAxMy45IDIxLjU2TDIwLjk3IDI4LjYzTDMzLjcgMTUuOTA0QzM0LjA3NSAxNS41Mjg3IDM0LjU4MzggMTUuMzE3OCAzNS4xMTQzIDE1LjMxNzZDMzUuNjQ0OCAxNS4zMTc0IDM2LjE1MzcgMTUuNTI4IDM2LjUyOSAxNS45MDNDMzYuOTA0MyAxNi4yNzggMzcuMTE1MiAxNi43ODY4IDM3LjExNTQgMTcuMzE3M0MzNy4xMTU2IDE3Ljg0NzggMzYuOTA1IDE4LjM1NjcgMzYuNTMgMTguNzMyTDIyLjM4NiAzMi44NzZDMjIuMjAwNCAzMy4wNjE2IDIxLjk3OTkgMzMuMjA4OCAyMS43MzcyIDMzLjMwOUMyMS40OTQ2IDMzLjQwOTIgMjEuMjM0NSAzMy40NjA1IDIwLjk3MiAzMy40NloiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=" />
            </div>
            <p class={ this.cameraMessageIdentityCardClassName } ref={ el => this.cameraMessageIdentityCard = el as HTMLParagraphElement }></p>
          </div>
        </div>

        {/* PaymentCard camera experience */}
        <div id="card-payment" class={ classNames({ visible: this.type === CameraExperience.PaymentCard }) }>
          <div class="rectangle-container">
            <div class="box wrapper"></div>
            <div class="box body">
              <div class="middle-left wrapper"></div>
              <div class={ this.cameraCursorPaymentCardClassName }>
                <div class="rectangle__cursor">
                  <div class="rectangle__el"></div>
                  <div class="rectangle__el"></div>
                  <div class="rectangle__el"></div>
                  <div class="rectangle__el"></div>

                  <div class={ `scanning-line ${this.scanningLinePaymentCardClassName}` }></div>
                </div>
              </div>
              <p class="message" ref={ el => this.cameraMessagePaymentCard = el as HTMLParagraphElement }></p>
              <div class="middle-right wrapper"></div>
            </div>
            <div class="box wrapper"></div>
          </div>
        </div>

        <div class="gradient-overlay bottom"></div>

        <mb-camera-toolbar
          clear-is-camera-active={this.clearIsCameraActive}
          show-close={ this.apiState !== "error" }
          camera-flipped={ this.cameraFlipped }
          onCloseEvent={() => this.handleStop()}
          onFlipEvent={() => this.flipCamera()}
          onChangeCameraDevice={(ev: CustomEvent<CameraEntry>) => this.handleChangeCameraDevice(ev.detail)}
          ref={ el => this.cameraToolbar = el as HTMLMbCameraToolbarElement }
        ></mb-camera-toolbar>
      </Host>
    );
  }
}
