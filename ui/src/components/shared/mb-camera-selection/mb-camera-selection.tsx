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
  State
} from '@stencil/core';

import { CameraEntry } from '../../../utils/data-structures';
import { classNames } from '../../../utils/generic.helpers';
import { getCameraDevices } from '../../../utils/sdk.service';

@Component({
  tag: 'mb-camera-selection',
  styleUrl: 'mb-camera-selection.scss',
  shadow: true,
})
export class MbCameraSelection {
  @State() activeCamera: CameraEntry = {
    prettyName: '-',
    details: { deviceId: -1 }
  };

  @State() cameraList: Array<CameraEntry> = [];

  @State() isListVisible: boolean = false;

  /**
   * Emitted when user selects a different camera device.
   */
  @Event() changeCameraDevice: EventEmitter<CameraEntry>;

  /**
   * Change active camera.
   */
  @Method()
  async setActiveCamera(cameraId: string) {
    const camera = this.cameraList.find((el: CameraEntry) => el.details.deviceId === cameraId);

    if (!camera) {
      return;
    }

    this.activeCamera = camera;
  }

  /**
   * Populate list of camera devices.
   */
  @Method()
  async populateCameraDevices() {
    try {
      const devices = await getCameraDevices();
      this.cameraList = devices;
    }
    catch (error) {
      // Camera access error is handled by the video recognizer.
      this.cameraList = [];
    }
  }

  private handleListOpen(ev: UIEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.setListVisibility(!this.isListVisible);
  }

  private handleCameraSelection(ev: UIEvent, camera: CameraEntry) {
    ev.preventDefault();
    ev.stopPropagation();
    this.changeCameraDevice.emit(camera);
    this.activeCamera = camera;
    this.setListVisibility(false);
  }

  private setListVisibility(visible: boolean) {
    this.isListVisible = visible;
  }

  render() {
    const cameraListElements = this.cameraList.map((camera: CameraEntry) => {
      const isActive = this.activeCamera?.details?.deviceId === camera.details.deviceId;

      let content = ( <span class="spacer"></span> )

      if (isActive) {
        content = (
          <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M17.256 5.24408C17.5814 5.56951 17.5814 6.09715 17.256 6.42259L8.92263 14.7559C8.59719 15.0814 8.06955 15.0814 7.74412 14.7559L3.57745 10.5893C3.25201 10.2638 3.25201 9.73618 3.57745 9.41074C3.90289 9.08531 4.43053 9.08531 4.75596 9.41074L8.33337 12.9882L16.0775 5.24408C16.4029 4.91864 16.9305 4.91864 17.256 5.24408Z" fill="#48B2E8"/>
          </svg>
        )
      }

      return (
        <li part="mb-camera-selection" class={ classNames({ active: isActive }) }>
          <a
            href="javascript:void(0)"
            onClick={ (ev: UIEvent) => this.handleCameraSelection(ev, camera) }>
            { content }
            <span class="name">{ camera.prettyName }</span>
          </a>
        </li>
      )
    });

    return (
      <Host part="mb-camera-selection">
        <a
          href="javascript:void(0)"
          class={ this.isListVisible ? 'active-camera active' : 'active-camera' }
          onClick={ (ev: UIEvent) => this.handleListOpen(ev) }>
          <span class="icon">
            <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.82145 2.98816C7.13401 2.6756 7.55793 2.5 7.99996 2.5H13C13.442 2.5 13.8659 2.6756 14.1785 2.98816C14.491 3.30072 14.6666 3.72464 14.6666 4.16667C14.6666 4.38768 14.7544 4.59964 14.9107 4.75592C15.067 4.9122 15.2789 5 15.5 5H16.3333C16.9963 5 17.6322 5.26339 18.1011 5.73223C18.5699 6.20107 18.8333 6.83696 18.8333 7.5V15C18.8333 15.663 18.5699 16.2989 18.1011 16.7678C17.6322 17.2366 16.9963 17.5 16.3333 17.5H4.66663C4.00358 17.5 3.3677 17.2366 2.89886 16.7678C2.43002 16.2989 2.16663 15.663 2.16663 15V7.5C2.16663 6.83696 2.43002 6.20107 2.89886 5.73223C3.3677 5.26339 4.00358 5 4.66663 5H5.49996C5.72097 5 5.93293 4.9122 6.08922 4.75592C6.2455 4.59964 6.33329 4.38768 6.33329 4.16667C6.33329 3.72464 6.50889 3.30072 6.82145 2.98816ZM4.66663 6.66667C4.44561 6.66667 4.23365 6.75446 4.07737 6.91074C3.92109 7.06702 3.83329 7.27899 3.83329 7.5V15C3.83329 15.221 3.92109 15.433 4.07737 15.5893C4.23365 15.7455 4.44561 15.8333 4.66663 15.8333H16.3333C16.5543 15.8333 16.7663 15.7455 16.9225 15.5893C17.0788 15.433 17.1666 15.221 17.1666 15V7.5C17.1666 7.27899 17.0788 7.06702 16.9225 6.91074C16.7663 6.75446 16.5543 6.66667 16.3333 6.66667H15.5C14.8369 6.66667 14.201 6.40327 13.7322 5.93443C13.2634 5.46559 13 4.82971 13 4.16667L7.99996 4.16667C7.99996 4.82971 7.73657 5.46559 7.26773 5.93443C6.79889 6.40327 6.163 6.66667 5.49996 6.66667H4.66663Z" fill="white"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M10.5 9.16667C9.57948 9.16667 8.83329 9.91286 8.83329 10.8333C8.83329 11.7538 9.57948 12.5 10.5 12.5C11.4204 12.5 12.1666 11.7538 12.1666 10.8333C12.1666 9.91286 11.4204 9.16667 10.5 9.16667ZM7.16663 10.8333C7.16663 8.99238 8.65901 7.5 10.5 7.5C12.3409 7.5 13.8333 8.99238 13.8333 10.8333C13.8333 12.6743 12.3409 14.1667 10.5 14.1667C8.65901 14.1667 7.16663 12.6743 7.16663 10.8333Z" fill="white"/>
            </svg>
          </span>
          <span class="name">{ this.activeCamera.prettyName }</span>
          <span class="icon">
            <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M4.9107 6.91076C5.23614 6.58533 5.76378 6.58533 6.08922 6.91076L10.5 11.3215L14.9107 6.91076C15.2361 6.58533 15.7638 6.58533 16.0892 6.91076C16.4147 7.2362 16.4147 7.76384 16.0892 8.08928L11.0892 13.0893C10.7638 13.4147 10.2361 13.4147 9.9107 13.0893L4.9107 8.08928C4.58527 7.76384 4.58527 7.2362 4.9107 6.91076Z" fill="white"/>
            </svg>
          </span>
        </a>
        <div
          id="list-background"
          class={ classNames({ visible: this.isListVisible }) }
          onClick={ () => this.setListVisibility(false) }
        ></div>
        <div
          class={ this.isListVisible ? 'list visible' : 'list' }>
          <ul>
            { cameraListElements }
          </ul>
        </div>
      </Host>
    );
  }
}
