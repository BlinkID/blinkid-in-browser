/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import {
  Component,
  Event,
  EventEmitter,
  Host,
  h,
  Method,
  Prop,
  Watch
} from '@stencil/core';

import {
  CameraEntry,
  CameraExperience,
  CameraExperienceState,
  CameraExperienceStateDuration
} from '../../../utils/data-structures';

import { TranslationService } from '../../../utils/translation.service';

@Component({
  tag: 'mb-camera-experience',
  styleUrl: 'mb-camera-experience.scss',
  shadow: true,
})
export class MbCameraExperience {

  /**
   * Choose desired camera experience.
   *
   * Each experience type must be implemented in this component.
   */
  @Prop() type: CameraExperience;

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
  @Prop() cameraFlipped: boolean = false;

  /**
   * Show scanning line on camera
   */
  @Prop() showScanningLine: boolean = false;

  /**
   * Show camera feedback message on camera for Barcode scanning
   */
   @Prop() showCameraFeedbackBarcodeMessage: boolean = false;

  /**
   * Emitted when user clicks on 'X' button.
   */
  @Event() close: EventEmitter<void>;

  /**
   * Emitted when user selects a different camera device.
   */
  @Event() changeCameraDevice: EventEmitter<CameraEntry>;

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

  @Watch('apiState')
  apiStateHandler(apiState: string, _oldValue: string) {
    if (apiState === '' && (this.type === CameraExperience.CardSingleSide || this.type === CameraExperience.CardCombined))
      this.cardIdentityElement.classList.add('visible');
    else
      this.cardIdentityElement.classList.remove('visible');
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

      const stateClass = this.getStateClass(state);

      switch (this.type) {
        case CameraExperience.CardSingleSide:
        case CameraExperience.CardCombined:
          this.cameraCursorIdentityCard.setAttribute('class', `reticle ${stateClass}`);
          break;
        case CameraExperience.Barcode:
          stateClass === 'is-detection' && this.showScanningLine ? this.scanningLineBarcode.classList.add('is-active') : this.scanningLineBarcode.classList.remove('is-active');
          this.cameraCursorBarcode.setAttribute('class', `rectangle ${stateClass}`);
          break;
        case CameraExperience.PaymentCard:
          stateClass === 'is-default' && this.showScanningLine ? this.scanningLinePaymentCard.classList.add('is-active') : this.scanningLinePaymentCard.classList.remove('is-active');
          this.cameraCursorPaymentCard.setAttribute('class', `rectangle ${stateClass}`);
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
      }, CameraExperienceStateDuration.get(state));
    });
  }

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

  render() {
    return (
      <Host class={ this.showOverlay ? '' : 'no-overlay' }>
        {/* Barcode camera experience */}
        <div id="barcode" class={ this.type === CameraExperience.Barcode ? 'visible' : '' }>
          <div class="rectangle-container">
            <div class="rectangle" ref={ el => this.cameraCursorBarcode = el as HTMLDivElement }>
              <div class="rectangle__cursor">
                <div class="rectangle__el"></div>
                <div class="rectangle__el"></div>
                <div class="rectangle__el"></div>
                <div class="rectangle__el"></div>

                <div class="scanning-line" ref={ el => this.scanningLineBarcode = el as HTMLDivElement }></div>
              </div>
            </div>
            <p class="message" ref={ el => this.cameraMessageBarcode = el as HTMLParagraphElement }></p>
          </div>
        </div>

        {/* Identity card camera experience */}
        <div id="card-identity" ref={(el) => this.cardIdentityElement = el as HTMLDivElement} class={ this.type === CameraExperience.CardSingleSide || this.type === CameraExperience.CardCombined ? 'visible': '' }>
          <div class="reticle-container">
            <div class="reticle" ref={ el => this.cameraCursorIdentityCard = el as HTMLDivElement }>
              <div class="reticle__cursor">
                <div class="reticle__el"></div>
                <div class="reticle__el"></div>
                <div class="reticle__el"></div>
                <div class="reticle__el"></div>
              </div>
              <img class="reticle__done" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwLjk3MiAzMy40NkMyMC43MDk1IDMzLjQ2MDUgMjAuNDQ5NCAzMy40MDkyIDIwLjIwNjggMzMuMzA5QzE5Ljk2NDEgMzMuMjA4OCAxOS43NDM2IDMzLjA2MTYgMTkuNTU4IDMyLjg3NkwxMS4wNzQgMjQuMzlDMTAuODgyOSAyNC4yMDU2IDEwLjczMDMgMjMuOTg1MSAxMC42MjU0IDIzLjc0MTFDMTAuNTIwNCAyMy40OTcyIDEwLjQ2NSAyMy4yMzQ4IDEwLjQ2MjUgMjIuOTY5MkMxMC40NiAyMi43MDM3IDEwLjUxMDQgMjIuNDQwMyAxMC42MTA4IDIyLjE5NDRDMTAuNzExMiAyMS45NDg2IDEwLjg1OTYgMjEuNzI1MiAxMS4wNDcyIDIxLjUzNzNDMTEuMjM0OSAyMS4zNDkzIDExLjQ1ODEgMjEuMjAwNyAxMS43MDM4IDIxLjA5OTlDMTEuOTQ5NSAyMC45OTkyIDEyLjIxMjggMjAuOTQ4NCAxMi40Nzg0IDIwLjk1MDVDMTIuNzQzOSAyMC45NTI2IDEzLjAwNjQgMjEuMDA3NiAxMy4yNTA1IDIxLjExMjNDMTMuNDk0NiAyMS4yMTY5IDEzLjcxNTQgMjEuMzY5MSAxMy45IDIxLjU2TDIwLjk3IDI4LjYzTDMzLjcgMTUuOTA0QzM0LjA3NSAxNS41Mjg3IDM0LjU4MzggMTUuMzE3OCAzNS4xMTQzIDE1LjMxNzZDMzUuNjQ0OCAxNS4zMTc0IDM2LjE1MzcgMTUuNTI4IDM2LjUyOSAxNS45MDNDMzYuOTA0MyAxNi4yNzggMzcuMTE1MiAxNi43ODY4IDM3LjExNTQgMTcuMzE3M0MzNy4xMTU2IDE3Ljg0NzggMzYuOTA1IDE4LjM1NjcgMzYuNTMgMTguNzMyTDIyLjM4NiAzMi44NzZDMjIuMjAwNCAzMy4wNjE2IDIxLjk3OTkgMzMuMjA4OCAyMS43MzcyIDMzLjMwOUMyMS40OTQ2IDMzLjQwOTIgMjEuMjM0NSAzMy40NjA1IDIwLjk3MiAzMy40NloiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=" />
            </div>
            <p class="message" ref={ el => this.cameraMessageIdentityCard = el as HTMLParagraphElement }></p>
          </div>
        </div>

        {/* PaymentCard camera experience */}
        <div id="card-payment" class={ this.type === CameraExperience.PaymentCard ? 'visible' : '' }>
          <div class="rectangle-container">
            <div class="box wrapper"></div>
            <div class="box body">
              <div class="middle-left wrapper"></div>
              <div class="rectangle" ref={ el => this.cameraCursorPaymentCard = el as HTMLDivElement }>
                <div class="rectangle__cursor">
                  <div class="rectangle__el"></div>
                  <div class="rectangle__el"></div>
                  <div class="rectangle__el"></div>
                  <div class="rectangle__el"></div>

                  <div class="scanning-line" ref={ el => this.scanningLinePaymentCard = el as HTMLDivElement }></div>
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

  private cameraCursorBarcode!: HTMLDivElement;
  private cameraCursorIdentityCard!: HTMLDivElement;
  private cameraCursorPaymentCard!: HTMLDivElement;
  private cameraMessageIdentityCard!: HTMLParagraphElement;
  private cameraMessagePaymentCard!: HTMLParagraphElement;
  private cameraMessageBarcode!: HTMLParagraphElement;
  private cameraToolbar!: HTMLMbCameraToolbarElement;
  private cardIdentityElement!: HTMLDivElement;

  // Flags
  private cameraStateChangeId: number = 0;
  private cameraStateInProgress: boolean = false;
  private flipCameraStateInProgress: boolean = false;
  private barcodeScanningInProgress: boolean = false;

  private scanningLineBarcode!: HTMLDivElement;
  private scanningLinePaymentCard!: HTMLDivElement;

  private flipCamera(): void {
    this.flipCameraAction.emit();
  }

  private handleStop() {
    this.close.emit();
  }

  private getStateClass(state: CameraExperienceState): string {
    let stateClass = 'is-default';

    switch (state) {
      case CameraExperienceState.BarcodeScanning:
      case CameraExperienceState.Classification:
        stateClass = 'is-classification';
        break;

      case CameraExperienceState.Default:
        stateClass = 'is-default';
        break;

      case CameraExperienceState.Detection:
        stateClass = 'is-detection';
        break;

      case CameraExperienceState.MoveFarther:
        stateClass = 'is-error-move-farther';
        break;

      case CameraExperienceState.MoveCloser:
        stateClass = 'is-error-move-closer';
        break;

      case CameraExperienceState.AdjustAngle:
        stateClass = 'is-error-adjust-angle';
        break;

      case CameraExperienceState.Flip:
        stateClass = 'is-flip';
        break;

      case CameraExperienceState.Done:
        stateClass = 'is-done';
        break;

      case CameraExperienceState.DoneAll:
        stateClass = 'is-done-all';
        break;

      default:
        // Reset class
    }

    return stateClass;
  }

  private setMessage(state: CameraExperienceState, isBackSide: boolean, type: CameraExperience): void {
    const message = this.getStateMessage(state, isBackSide, type);

    switch (type) {
      case CameraExperience.CardSingleSide:
      case CameraExperience.CardCombined:
        while (this.cameraMessageIdentityCard.firstChild) {
          this.cameraMessageIdentityCard.removeChild(this.cameraMessageIdentityCard.firstChild);
        }

        if (message) {
          this.cameraMessageIdentityCard.appendChild(message);
        }

        this.cameraMessageIdentityCard.setAttribute('class', message && message !== null ? 'message is-active' : 'message');
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
}
