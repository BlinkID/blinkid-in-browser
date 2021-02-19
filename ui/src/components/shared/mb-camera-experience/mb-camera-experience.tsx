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
   * Emitted when user clicks on 'X' button.
   */
  @Event() close: EventEmitter<void>;

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
    if (isFlipped)
      this.cameraFlipBtn.classList.add('flipped');
    else
      this.cameraFlipBtn.classList.remove('flipped');
  }


  /**
   * Set camera scanning state.
   */
  @Method()
  setState(state: CameraExperienceState, isBackSide: boolean = false, force: boolean = false): Promise<void> {
    return new Promise((resolve) => {
      if (!force && (!state || this.cameraStateInProgress || this.flipCameraStateInProgress)) {
        resolve();
        return;
      }

      this.cameraStateInProgress = true;

      if (state === CameraExperienceState.Flip) {
        this.flipCameraStateInProgress = true;
      }

      const stateClass = this.getStateClass(state);
      switch(this.type) {
        case CameraExperience.CardSingleSide:
        case CameraExperience.CardCombined:
          this.cameraCursorIdentityCard.setAttribute('class', `reticle ${stateClass}`);
          break;
        case CameraExperience.Barcode:
          this.cameraCursorBarcode.setAttribute('class', `rectangle ${stateClass}`);
          break;
        case CameraExperience.BlinkCard:
          stateClass === 'is-default' && this.showScanningLine ? this.scanningLine.classList.add('is-active') : this.scanningLine.classList.remove('is-active');
          this.cameraCursorBlinkCard.setAttribute('class', `rectangle ${stateClass}`);
          break;
      }

      this.setMessage(state, isBackSide, this.type);

      window.setTimeout(() => {
        if (this.flipCameraStateInProgress && state === CameraExperienceState.Flip) {
          this.flipCameraStateInProgress = false;
        }
        this.cameraStateInProgress = false;
        resolve();
      }, CameraExperienceStateDuration.get(state));
    });
  }



  render() {
    return (
      <Host class={ this.showOverlay ? '' : 'no-overlay' }>
        <div class="gradient-overlay top"></div>

        {/* Barcode camera experience */}
        <div id="barcode" class={ this.type === CameraExperience.Barcode ? 'visible' : '' }>
          <div class="rectangle-container">
            <div class="rectangle" ref={ el => this.cameraCursorBarcode = el as HTMLDivElement }>
                <div class="rectangle__el"></div>
                <div class="rectangle__el"></div>
                <div class="rectangle__el"></div>
                <div class="rectangle__el"></div>
            </div>
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

        {/* BlinkCard camera experience */}
        <div id="blinkcard" class={ this.type === CameraExperience.BlinkCard ? 'visible' : '' }>
          <div class="rectangle-container">
            <div class="rectangle" ref={ el => this.cameraCursorBlinkCard = el as HTMLDivElement }>
              <div class="rectangle__cursor">
                <div class="rectangle__el"></div>
                <div class="rectangle__el"></div>
                <div class="rectangle__el"></div>
                <div class="rectangle__el"></div>
              </div>
              <div class="scanning-line" ref={ el => this.scanningLine = el as HTMLDivElement }></div>
            </div>
            <p class="message" ref={ el => this.cameraMessageBlinkCard = el as HTMLParagraphElement }></p>
          </div>
        </div>

        <div class="gradient-overlay bottom"></div>

        <div class="controls">
          { this.apiState !== 'error' &&
            <a href="javascript:void(0)" onClick={ (ev: UIEvent) => this.handleStop(ev) } class="close-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289Z" fill="white"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="white"/>
              </svg>
            </a>
          }

          <button type="button" id="flipBtn" class={ !this.cameraFlipped ? '' : 'flipped' } onClick={() => this.flipCamera()} ref={ el => this.cameraFlipBtn = el as HTMLButtonElement }>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M16 5C16.5523 5 17 5.44772 17 6V24C17 24.5523 16.5523 25 16 25C15.4477 25 15 24.5523 15 24V6C15 5.44772 15.4477 5 16 5Z" fill="white"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M19.7702 9.02676C20.2216 8.9202 20.687 9.13798 20.8944 9.55279L25.8944 19.5528C26.0494 19.8628 26.0329 20.2309 25.8507 20.5257C25.6684 20.8206 25.3466 21 25 21H20C19.4477 21 19 20.5523 19 20V10C19 9.53623 19.3189 9.13331 19.7702 9.02676ZM21 14.2361V19H23.382L21 14.2361Z" fill="white"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2298 9.02676C12.6811 9.13331 13 9.53623 13 10V20C13 20.5523 12.5523 21 12 21H7C6.65342 21 6.33156 20.8206 6.14935 20.5257C5.96714 20.2309 5.95058 19.8628 6.10557 19.5528L11.1056 9.55279C11.313 9.13798 11.7784 8.9202 12.2298 9.02676ZM8.61803 19H11V14.2361L8.61803 19Z" fill="white"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M19.7702 9.02676C20.2216 8.9202 20.687 9.13798 20.8944 9.55279L25.8944 19.5528C26.0494 19.8628 26.0329 20.2309 25.8507 20.5257C25.6684 20.8206 25.3466 21 25 21H20C19.4477 21 19 20.5523 19 20V10C19 9.53623 19.3189 9.13331 19.7702 9.02676Z" fill="white"/>
            </svg>
          </button>
        </div>
      </Host>
    );
  }

  private cameraCursorBarcode!: HTMLDivElement;
  private cameraCursorIdentityCard!: HTMLDivElement;
  private cameraCursorBlinkCard!: HTMLDivElement;
  private cameraMessageIdentityCard!: HTMLParagraphElement;
  private cameraMessageBlinkCard!: HTMLParagraphElement;
  private cameraStateInProgress: boolean = false;
  private cardIdentityElement: HTMLDivElement;
  private cameraFlipBtn: HTMLButtonElement;
  private flipCameraStateInProgress: boolean = false;
  
  private scanningLine!: HTMLDivElement;

  private flipCamera(): void {
    this.flipCameraAction.emit();
  }

  private handleStop(ev: UIEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.close.emit();
  }

  private getStateClass(state: CameraExperienceState): string {
    let stateClass = 'is-default';

    switch (state) {
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
    const message = this.getStateMessage(state, isBackSide);

    switch(type) {
      case CameraExperience.CardSingleSide:
      case CameraExperience.CardCombined:
        while (this.cameraMessageIdentityCard.firstChild) {
          this.cameraMessageIdentityCard.removeChild(this.cameraMessageIdentityCard.firstChild);
        }
        if (message) this.cameraMessageIdentityCard.appendChild(message);

        this.cameraMessageIdentityCard.setAttribute('class', message && message !== null ? 'message is-active' : 'message');
        break;
      case CameraExperience.BlinkCard:
        while (this.cameraMessageBlinkCard.firstChild) {
          this.cameraMessageBlinkCard.removeChild(this.cameraMessageBlinkCard.firstChild);
        }
        if (message) this.cameraMessageBlinkCard.appendChild(message);
    
        this.cameraMessageBlinkCard.setAttribute('class', message && message !== null ? 'message is-active' : 'message');
        break;
      default:
        // Do nothing
    }
  }

  private getStateMessage(state: CameraExperienceState, isBackSide: boolean = false): HTMLSpanElement|null {
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
        const key = isBackSide ? 'camera-feedback-scan-back' : 'camera-feedback-scan-front';
        return getStateMessageAsHTML(this.translationService.i(key));

      case CameraExperienceState.MoveFarther:
        return getStateMessageAsHTML(this.translationService.i('camera-feedback-move-farther'));

      case CameraExperienceState.MoveCloser:
        return getStateMessageAsHTML(this.translationService.i('camera-feedback-move-closer'));

      case CameraExperienceState.AdjustAngle:
        return getStateMessageAsHTML(this.translationService.i('camera-feedback-adjust-angle'));

      case CameraExperienceState.Flip:
        return getStateMessageAsHTML(this.translationService.i('camera-feedback-flip'));

      case CameraExperienceState.Classification:
      case CameraExperienceState.Detection:
      case CameraExperienceState.Done:
      case CameraExperienceState.DoneAll:
      default:
        return null;
    }
  }
}
