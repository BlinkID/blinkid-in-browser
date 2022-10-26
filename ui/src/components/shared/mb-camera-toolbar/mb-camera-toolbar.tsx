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
  Listen
} from '@stencil/core';

import { CameraEntry } from '../../../utils/data-structures';
import * as DeviceHelpers from '../../../utils/device.helpers';
import { setWebComponentParts, classNames } from '../../../utils/generic.helpers';

@Component({
  tag: 'mb-camera-toolbar',
  styleUrl: 'mb-camera-toolbar.scss',
  shadow: true
})
export class MbCameraToolbar {

  private cameraSelection!: HTMLMbCameraSelectionElement;

  @State() showCloseButton: boolean = false;

  @State() isDesktop: boolean = DeviceHelpers.isDesktop();
  
  /**
   * Set to `true` if close button should be displayed.
   */
  @Prop() showClose: boolean = false;

  @Prop() clearIsCameraActive: boolean = false;

  /**
   * Whether to show 'Camera flip' button.
   */
  @Prop() enableCameraFlip: boolean = false;

  /**
   * Whether the camera is flipped, this property will be flip the relevant icon.
   */
  @Prop() cameraFlipped: boolean = false;

  /**
   * Emitted when camera stream becomes active.
   */
  @Event() setIsCameraActive: EventEmitter<boolean>

  /**
   * Event which is triggered when close button is clicked.
   */
  @Event() closeEvent: EventEmitter<void>;

  /**
   * Event which is triggered when flip camera button is clicked.
   */
  @Event() flipEvent: EventEmitter<void>;

  /**
   * Emitted when user selects a different camera device.
   */
  @Event() changeCameraDevice: EventEmitter<CameraEntry>;

  /**
   * Host element as variable for manipulation
   */
  @Element() hostEl: HTMLElement;

  componentDidLoad() {
    setWebComponentParts(this.hostEl);
  }

  connectedCallback() {
    window.addEventListener('resize', this.handleResize, false);
    this.handleResize();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize, false);
  }

  /**
   * Change active camera.
   */
  @Method()
  async setActiveCamera(cameraId: string) {
    this.cameraSelection.setActiveCamera(cameraId);
    this.showCloseButton = this.showClose;
  }

  /**
   * Populate list of camera devices.
   */
  @Method()
  async populateCameraDevices() {
    await this.cameraSelection.populateCameraDevices();
  }

  private handleClose(ev: UIEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.closeEvent.emit();
    this.showCloseButton = false;
  }

  private handleFlip(ev: UIEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.flipEvent.emit();
  }

  private handleResize = () => {
    this.isDesktop = DeviceHelpers.isDesktop();
  }

  private handleChangeCameraDevice(camera: CameraEntry) {
    this.changeCameraDevice.emit(camera);
  }

  @Listen('setIsCameraActive', { capture: true })
  handleSetIsCameraActive(ev:CustomEvent<boolean>) {
    if (ev.detail) {
      this.showCloseButton = this.showClose;
    } else {
      this.showCloseButton = ev.detail;
    }
  }

  render() {
    let flipButton = '';

    if (this.enableCameraFlip) {
      flipButton = (
        <button
          class={ this.cameraFlipped ? 'toolbar-button flip-button flipped' : 'toolbar-button flip-button' }
          onClick={ (ev: UIEvent) => this.handleFlip(ev) }>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M16 5C16.5523 5 17 5.44772 17 6V24C17 24.5523 16.5523 25 16 25C15.4477 25 15 24.5523 15 24V6C15 5.44772 15.4477 5 16 5Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M19.7702 9.02676C20.2216 8.9202 20.687 9.13798 20.8944 9.55279L25.8944 19.5528C26.0494 19.8628 26.0329 20.2309 25.8507 20.5257C25.6684 20.8206 25.3466 21 25 21H20C19.4477 21 19 20.5523 19 20V10C19 9.53623 19.3189 9.13331 19.7702 9.02676ZM21 14.2361V19H23.382L21 14.2361Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.2298 9.02676C12.6811 9.13331 13 9.53623 13 10V20C13 20.5523 12.5523 21 12 21H7C6.65342 21 6.33156 20.8206 6.14935 20.5257C5.96714 20.2309 5.95058 19.8628 6.10557 19.5528L11.1056 9.55279C11.313 9.13798 11.7784 8.9202 12.2298 9.02676ZM8.61803 19H11V14.2361L8.61803 19Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M19.7702 9.02676C20.2216 8.9202 20.687 9.13798 20.8944 9.55279L25.8944 19.5528C26.0494 19.8628 26.0329 20.2309 25.8507 20.5257C25.6684 20.8206 25.3466 21 25 21H20C19.4477 21 19 20.5523 19 20V10C19 9.53623 19.3189 9.13331 19.7702 9.02676Z" fill="white"/>
          </svg>
        </button>
      )
    }

    let closeButton = '';

    if (this.showCloseButton) {
      closeButton = (
        <button
          class="toolbar-button close-button"
          onClick={ (ev: UIEvent) => this.handleClose(ev) }>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="white"/>
          </svg>
        </button>
      )
    }
    return (
      <Host>
        <header>
          { flipButton }
          <div class="camera-selection-wrapper">
            <mb-camera-selection  
              clear-is-camera-active={ !this.showCloseButton || this.clearIsCameraActive } 
              onChangeCameraDevice={ (ev: CustomEvent<CameraEntry>) => this.handleChangeCameraDevice(ev.detail) }
              class={ classNames({ visible: this.isDesktop }) }
              ref={ el => this.cameraSelection = el as HTMLMbCameraSelectionElement }
            ></mb-camera-selection>
          </div>
          { closeButton }
        </header>
      </Host>
    );
  }
}
