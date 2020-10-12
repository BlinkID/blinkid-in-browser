import {
  Component,
  Event,
  EventEmitter,
  Host,
  h,
  Method,
  Prop
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
   * Emitted when user clicks on 'X' button.
   */
  @Event() close: EventEmitter<void>;

  /**
   * Set camera scanning state.
   */
  @Method()
  setState(state: CameraExperienceState, isBackSide: boolean = false, force: boolean = false): Promise<void> {
    return new Promise((resolve) => {
      if (!force && (!state || this.cameraStateInProgress)) {
        resolve();
        return;
      }

      this.cameraStateInProgress = true;

      this.cameraReticle.setAttribute('class', this.getStateClass(state, this.type));
      this.cameraRectangle.setAttribute('class', this.getStateClass(state, this.type));

      // Clear cameraMessage and set new message
      while (this.cameraMessage.firstChild) {
        this.cameraMessage.removeChild(this.cameraMessage.firstChild);
      }

      const message = this.getStateMessage(state, isBackSide);
      if (message) {
        this.cameraMessage.appendChild(message);
      }

      this.cameraMessage.setAttribute('class', message !== null ? 'message is-active' : 'message');

      window.setTimeout(() => {
        this.cameraStateInProgress = false;
        resolve();
      }, CameraExperienceStateDuration.get(state));
    });
  }

  render() {
    return (
      <Host class={ this.showOverlay ? '' : 'no-overlay' }>
        <div id="barcode" class={ this.type === CameraExperience.Barcode ? 'visible' : '' }>
          <div class="rectangle" ref={ el => this.cameraRectangle = el as HTMLDivElement }>
            { this.getEdge('top-right') }
            { this.getEdge('bottom-right') }
            { this.getEdge('top-left') }
            { this.getEdge('bottom-left') }
          </div>
        </div>

        <div id="card-identity" class={
          this.type === CameraExperience.CardSingleSide || this.type === CameraExperience.CardCombined ? 'visible': ''
        }>
          <div class="reticle-container">
            <div class="reticle" ref={ el => this.cameraReticle = el as HTMLDivElement }>
              <div class="reticle__cursor">
                <div class="reticle__el"></div>
                <div class="reticle__el"></div>
                <div class="reticle__el"></div>
                <div class="reticle__el"></div>
              </div>
              <img class="reticle__done" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwLjk3MiAzMy40NkMyMC43MDk1IDMzLjQ2MDUgMjAuNDQ5NCAzMy40MDkyIDIwLjIwNjggMzMuMzA5QzE5Ljk2NDEgMzMuMjA4OCAxOS43NDM2IDMzLjA2MTYgMTkuNTU4IDMyLjg3NkwxMS4wNzQgMjQuMzlDMTAuODgyOSAyNC4yMDU2IDEwLjczMDMgMjMuOTg1MSAxMC42MjU0IDIzLjc0MTFDMTAuNTIwNCAyMy40OTcyIDEwLjQ2NSAyMy4yMzQ4IDEwLjQ2MjUgMjIuOTY5MkMxMC40NiAyMi43MDM3IDEwLjUxMDQgMjIuNDQwMyAxMC42MTA4IDIyLjE5NDRDMTAuNzExMiAyMS45NDg2IDEwLjg1OTYgMjEuNzI1MiAxMS4wNDcyIDIxLjUzNzNDMTEuMjM0OSAyMS4zNDkzIDExLjQ1ODEgMjEuMjAwNyAxMS43MDM4IDIxLjA5OTlDMTEuOTQ5NSAyMC45OTkyIDEyLjIxMjggMjAuOTQ4NCAxMi40Nzg0IDIwLjk1MDVDMTIuNzQzOSAyMC45NTI2IDEzLjAwNjQgMjEuMDA3NiAxMy4yNTA1IDIxLjExMjNDMTMuNDk0NiAyMS4yMTY5IDEzLjcxNTQgMjEuMzY5MSAxMy45IDIxLjU2TDIwLjk3IDI4LjYzTDMzLjcgMTUuOTA0QzM0LjA3NSAxNS41Mjg3IDM0LjU4MzggMTUuMzE3OCAzNS4xMTQzIDE1LjMxNzZDMzUuNjQ0OCAxNS4zMTc0IDM2LjE1MzcgMTUuNTI4IDM2LjUyOSAxNS45MDNDMzYuOTA0MyAxNi4yNzggMzcuMTE1MiAxNi43ODY4IDM3LjExNTQgMTcuMzE3M0MzNy4xMTU2IDE3Ljg0NzggMzYuOTA1IDE4LjM1NjcgMzYuNTMgMTguNzMyTDIyLjM4NiAzMi44NzZDMjIuMjAwNCAzMy4wNjE2IDIxLjk3OTkgMzMuMjA4OCAyMS43MzcyIDMzLjMwOUMyMS40OTQ2IDMzLjQwOTIgMjEuMjM0NSAzMy40NjA1IDIwLjk3MiAzMy40NloiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=" />
            </div>
            <p class="message" ref={ el => this.cameraMessage = el as HTMLParagraphElement }></p>
          </div>
        </div>

        <a href="#" onClick={ (ev: UIEvent) => this.handleStop(ev) } class="close-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="white"/>
          </svg>
        </a>
      </Host>
    );
  }

  private cameraReticle!: HTMLDivElement;
  private cameraRectangle!: HTMLDivElement;
  private cameraMessage!: HTMLParagraphElement;
  private cameraStateInProgress: boolean = false;

  private handleStop(ev: UIEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.close.emit();
  }

  private getEdge(id: string): SVGElement {
    return (
      <svg id={ id } width="82" height="82" viewBox="0 0 82 82" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_dd)">
          { this.getPath(id) }
        </g>
        <defs>
          <filter id="filter0_dd" x="0" y="0" width="82" height="82" filterUnits="userSpaceOnUse" color-interpolation-filters="s-rGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset dy="2"/>
            <feGaussianBlur stdDeviation="12"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset/>
            <feGaussianBlur stdDeviation="4"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="normal" in2="effect1_dropShadow" result="effect2_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow" result="shape"/>
          </filter>
        </defs>
      </svg>
    )
  }

  private getPath(direction: string): HTMLElement {
    if (direction === 'top-left') {
      return (<path d="M58 24H34C29.5817 24 26 27.5817 26 32V56" stroke="white" stroke-width="4"/>)
    }

    if (direction === 'top-right') {
      return (<path d="M24 24H48C52.4183 24 56 27.5817 56 32V56" stroke="white" stroke-width="4"/>)
    }

    if (direction === 'bottom-left') {
      return (<path d="M26 22V46C26 50.4183 29.5817 54 34 54H58" stroke="white" stroke-width="4"/>)
    }

    if (direction === 'bottom-right') {
      return (<path d="M56 22V46C56 50.4183 52.4183 54 48 54H24" stroke="white" stroke-width="4"/>)
    }
  }

  private getStateClass(state: CameraExperienceState, type: CameraExperience): string {
    let classNames;

    if (type === CameraExperience.Barcode) {
      classNames = ['rectangle'];
    }
    else {
      classNames = ['reticle'];
    }

    switch (state) {
      case CameraExperienceState.Classification:
        classNames.push('is-classification');
        break;

      case CameraExperienceState.Default:
        classNames.push('is-default');
        break;

      case CameraExperienceState.Detection:
        classNames.push('is-detection');
        break;

      case CameraExperienceState.MoveFarther:
        classNames.push('is-error-move-farther');
        break;

      case CameraExperienceState.MoveCloser:
        classNames.push('is-error-move-closer');
        break;

      case CameraExperienceState.AdjustAngle:
        classNames.push('is-error-adjust-angle');
        break;

      case CameraExperienceState.Flip:
        classNames.push('is-flip');
        break;

      case CameraExperienceState.Done:
        classNames.push('is-done');
        break;

      case CameraExperienceState.DoneAll:
        classNames.push('is-done-all');
        break;

      default:
        // Reset class
    }

    return classNames.join(' ');
  }

  private getStateMessage(state: CameraExperienceState, isBackSide: boolean = false): HTMLSpanElement|null {
    const getStateMessageAsHTML = (message: string|Array<string>): HTMLSpanElement => {
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
