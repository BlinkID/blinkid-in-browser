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

import {
  CameraEntry,
  CameraExperienceState,
  CameraExperienceTimeoutDurations,
  Code,
  MultiSideImageRecognitionConfiguration,
  MultiSideImageType,
  EventReady,
  EventScanError,
  EventScanSuccess,
  FeedbackCode,
  FeedbackMessage,
  ImageRecognitionConfiguration,
  ImageRecognitionType,
  RecognitionEvent,
  RecognitionStatus,
  VideoRecognitionConfiguration,
  SDKError
} from '../../../utils/data-structures';
import * as ErrorTypes from '../../../utils/error-structures';

import {
  CheckConclusion,
  SdkService
} from '../../../utils/sdk.service';

import * as BlinkIDSDK from '../../../../../es/blinkid-sdk';

import { TranslationService } from '../../../utils/translation.service';

import * as DeviceHelpers from '../../../utils/device.helpers';
import * as GenericHelpers from '../../../utils/generic.helpers';

import * as Utils from './mb-component.utils';

import { MbHelpCallbacks } from '../mb-help/mb-help.model';

@Component({
  tag: 'mb-component',
  styleUrl: 'mb-component.scss',
  shadow: true,
})
export class MbComponent {
  private screens: { [key: string]: HTMLMbScreenElement | null } = {
    action: null,
    error: null,
    loading: null,
    processing: null
  }

  private overlays: { [key: string]: HTMLMbOverlayElement | null } = {
    camera: null,
    draganddrop: null,
    processing: null,
    modal: null,
  }

  private cameraExperience!: HTMLMbCameraExperienceElement;
  private dragAndDropZone!: HTMLDivElement;
  private errorMessage!: HTMLParagraphElement;
  private scanFromCameraButton!: HTMLMbButtonElement;
  private scanFromImageButton!: HTMLMbButtonElement;
  private scanFromImageInput!: HTMLInputElement;
  private videoElement!: HTMLVideoElement;
  private licenseExperienceModal!: HTMLMbModalElement;
  private scanReset: boolean = false;
  private detectionSuccessLock = false;
  private isBackSide = false;
  private initialBodyOverflowValue: string;
  private cameraChangeInProgress: boolean = false;
  private blocked: boolean = false;
  private multiSideGalleryOpened = false;
  private imageRecognitionType: ImageRecognitionType;
  private imageBoxFirst: HTMLMbImageBoxElement;
  private imageBoxSecond: HTMLMbImageBoxElement;
  private areHelpScreensOpen: boolean = false;
  private galleryImageFirstFile: File | null = null;
  private galleryImageSecondFile: File | null = null;
  private multiSideScanFromImageButton: HTMLMbButtonClassicElement;

  private isCameraActive: boolean = false;

  @State() galleryExperienceModalErrorWindowVisible: boolean = false;

  @State() clearIsCameraActive: boolean = false;

  @State() apiProcessStatusVisible: boolean = false;

  @State() apiProcessStatusState: 'ERROR' | 'LOADING' | 'NONE' | 'SUCCESS' = 'NONE';

  /**
   * Host element as variable for manipulation (CSS in this case)
   */
  @Element() hostEl: HTMLElement;

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
  @Prop() workerLocation: string = '';

  /**
   * See description in public component.
   */
  @Prop() licenseKey: string;

  /**
   * See description in public component.
   */
   @Prop({ mutable: true }) wasmType: string | null;

  /**
   * See description in public component.
   */
  @Prop({ mutable: true }) recognizers: Array<string>;

  /**
   * See description in public component.
   */
  @Prop({ mutable: true }) recognizerOptions: { [key: string]: any };

  /**
   * See description in public component.
   */
  @Prop() recognitionTimeout: number;

  /**
   * See description in public component.
   */
  @Prop() recognitionPauseTimeout: number;

  /**
   * See description in public component.
   */
  @Prop() cameraExperienceStateDurations: CameraExperienceTimeoutDurations = null;

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
  @Prop() galleryOverlayType: 'FULLSCREEN' | 'INLINE' = 'INLINE';

  /**
   * See description in public component.
   */
  @Prop() galleryDropType: 'FULLSCREEN' | 'INLINE' = 'INLINE';

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
  @Prop() showCameraFeedbackBarcodeMessage: boolean = false;

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
  @Prop() iconDragAndDropGalleryDefault: string = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNCA4QzE0IDcuNDQ3NzIgMTQuNDQ3NyA3IDE1IDdIMTUuMDFDMTUuNTYyMyA3IDE2LjAxIDcuNDQ3NzIgMTYuMDEgOEMxNi4wMSA4LjU1MjI4IDE1LjU2MjMgOSAxNS4wMSA5SDE1QzE0LjQ0NzcgOSAxNCA4LjU1MjI4IDE0IDhaIiBmaWxsPSIjMDA2MkYyIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNyA1QzUuODk1NDMgNSA1IDUuODk1NDMgNSA3VjE3QzUgMTguMTA0NiA1Ljg5NTQzIDE5IDcgMTlIMTdDMTguMTA0NiAxOSAxOSAxOC4xMDQ2IDE5IDE3VjdDMTkgNS44OTU0MyAxOC4xMDQ2IDUgMTcgNUg3Wk0zIDdDMyA0Ljc5MDg2IDQuNzkwODYgMyA3IDNIMTdDMTkuMjA5MSAzIDIxIDQuNzkwODYgMjEgN1YxN0MyMSAxOS4yMDkxIDE5LjIwOTEgMjEgMTcgMjFIN0M0Ljc5MDg2IDIxIDMgMTkuMjA5MSAzIDE3VjdaIiBmaWxsPSIjMDA2MkYyIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOC42OTk2NiAxMS43MTQ1TDQuNzA3MTEgMTUuNzA3MUM0LjMxNjU4IDE2LjA5NzYgMy42ODM0MiAxNi4wOTc2IDMuMjkyODkgMTUuNzA3MUMyLjkwMjM3IDE1LjMxNjUgMi45MDIzNyAxNC42ODM0IDMuMjkyODkgMTQuMjkyOEw3LjI5Mjg5IDEwLjI5MjhMNy4zMDY2MiAxMC4yNzk0QzcuOTA5IDkuNjk5NzQgOC42NjQxOSA5LjMzMDA4IDkuNSA5LjMzMDA4QzEwLjMzNTggOS4zMzAwOCAxMS4wOTEgOS42OTk3NCAxMS42OTM0IDEwLjI3OTRMMTEuNzA3MSAxMC4yOTI4TDE2LjcwNzEgMTUuMjkyOEMxNy4wOTc2IDE1LjY4MzQgMTcuMDk3NiAxNi4zMTY1IDE2LjcwNzEgMTYuNzA3MUMxNi4zMTY2IDE3LjA5NzYgMTUuNjgzNCAxNy4wOTc2IDE1LjI5MjkgMTYuNzA3MUwxMC4zMDAzIDExLjcxNDVDOS45OTMxIDExLjQyMTIgOS43MTU5NCAxMS4zMzAxIDkuNSAxMS4zMzAxQzkuMjg0MDYgMTEuMzMwMSA5LjAwNjkgMTEuNDIxMiA4LjY5OTY2IDExLjcxNDVaIiBmaWxsPSIjMDA2MkYyIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTUuNjk5NyAxMy43MTQ1TDE0LjcwNzEgMTQuNzA3MUMxNC4zMTY2IDE1LjA5NzYgMTMuNjgzNCAxNS4wOTc2IDEzLjI5MjkgMTQuNzA3MUMxMi45MDI0IDE0LjMxNjUgMTIuOTAyNCAxMy42ODM0IDEzLjI5MjkgMTMuMjkyOEwxNC4yOTI5IDEyLjI5MjhMMTQuMzA2NiAxMi4yNzk0QzE0LjkwOSAxMS42OTk3IDE1LjY2NDIgMTEuMzMwMSAxNi41IDExLjMzMDFDMTcuMzM1OCAxMS4zMzAxIDE4LjA5MSAxMS42OTk3IDE4LjY5MzQgMTIuMjc5NEwxOC43MDcxIDEyLjI5MjhMMjAuNzA3MSAxNC4yOTI4QzIxLjA5NzYgMTQuNjgzNCAyMS4wOTc2IDE1LjMxNjUgMjAuNzA3MSAxNS43MDcxQzIwLjMxNjYgMTYuMDk3NiAxOS42ODM0IDE2LjA5NzYgMTkuMjkyOSAxNS43MDcxTDE3LjMwMDMgMTMuNzE0NUMxNi45OTMxIDEzLjQyMTIgMTYuNzE1OSAxMy4zMzAxIDE2LjUgMTMuMzMwMUMxNi4yODQxIDEzLjMzMDEgMTYuMDA2OSAxMy40MjEyIDE1LjY5OTcgMTMuNzE0NVoiIGZpbGw9IiMwMDYyRjIiLz4KPC9zdmc+Cg==';

  /**
   * See description in public component.
   */
  @Prop() iconDragAndDropWarningDefault: string = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMiA4QzEyLjU1MjMgOCAxMyA4LjQ0NzcyIDEzIDlWMTFDMTMgMTEuNTUyMyAxMi41NTIzIDEyIDEyIDEyQzExLjQ0NzcgMTIgMTEgMTEuNTUyMyAxMSAxMVY5QzExIDguNDQ3NzIgMTEuNDQ3NyA4IDEyIDhaTTEyIDE0QzEyLjU1MjMgMTQgMTMgMTQuNDQ3NyAxMyAxNVYxNS4wMUMxMyAxNS41NjIzIDEyLjU1MjMgMTYuMDEgMTIgMTYuMDFDMTEuNDQ3NyAxNi4wMSAxMSAxNS41NjIzIDExIDE1LjAxVjE1QzExIDE0LjQ0NzcgMTEuNDQ3NyAxNCAxMiAxNFoiIGZpbGw9IiNFMTFENDgiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMC40NzY0IDIuMzgzOTdDMTAuOTM4MSAyLjExMTgxIDExLjQ2NDIgMS45NjgyNiAxMi4wMDAxIDEuOTY4MjZDMTIuNTM1OSAxLjk2ODI2IDEzLjA2MjEgMi4xMTE4MSAxMy41MjM3IDIuMzgzOTdDMTMuOTgzMSAyLjY1NDg1IDE0LjM2MiAzLjA0MzMgMTQuNjIxNCAzLjUwOTI1TDIxLjYxODMgMTUuNzUzOUMyMS42NDA0IDE1Ljc5MjUgMjEuNjU5OCAxNS44MzI1IDIxLjY3NjUgMTUuODczN0MyMS44NTY2IDE2LjMxNzEgMjEuOTI4IDE2Ljc5NzEgMjEuODg0OCAxNy4yNzM3QzIxLjg0MTYgMTcuNzUwMiAyMS42ODUgMTguMjA5NiAyMS40MjgxIDE4LjYxMzNDMjEuMTcxMSAxOS4wMTcgMjAuODIxNCAxOS4zNTM0IDIwLjQwOCAxOS41OTQ0QzE5Ljk5NDUgMTkuODM1NCAxOS41Mjk0IDE5Ljk3NDEgMTkuMDUxNSAxOS45OTg3QzE5LjAzNDQgMTkuOTk5NiAxOS4wMTcyIDIwIDE5LjAwMDEgMjBINS4wNzAwNUM1LjA1ODU3IDIwIDUuMDQ3MTQgMTkuOTk5OCA1LjAzNTc1IDE5Ljk5OTRDNS4wMDY5NiAyMC4wMDA0IDQuOTc3ODggMjAuMDAwMiA0Ljk0ODU3IDE5Ljk5ODdDNC40NzA2NiAxOS45NzQxIDQuMDA1NTggMTkuODM1NCAzLjU5MjE2IDE5LjU5NDRDMy4xNzg3MyAxOS4zNTM0IDIuODI4OTYgMTkuMDE3IDIuNTcyMDQgMTguNjEzM0MyLjMxNTEzIDE4LjIwOTYgMi4xNTg1MiAxNy43NTAyIDIuMTE1MjkgMTcuMjczN0MyLjA3MjA3IDE2Ljc5NzEgMi4xNDM0OCAxNi4zMTcxIDIuMzIzNTcgMTUuODczN0MyLjM0MDMgMTUuODMyNSAyLjM1OTc1IDE1Ljc5MjUgMi4zODE4MSAxNS43NTM5TDkuMzc4NzQgMy41MDkyNUM5LjYzODA4IDMuMDQzMyAxMC4wMTcgMi42NTQ4NSAxMC40NzY0IDIuMzgzOTdaTTUuMDM3NjcgMTguMDAwNUM1LjA0ODQyIDE4LjAwMDIgNS4wNTkyMiAxOCA1LjA3MDA1IDE4SDE4Ljk2OTlDMTkuMTIxNyAxNy45ODg5IDE5LjI2OTEgMTcuOTQzMyAxOS40MDA3IDE3Ljg2NjZDMTkuNTM4NSAxNy43ODYzIDE5LjY1NTEgMTcuNjc0MSAxOS43NDA3IDE3LjUzOTVDMTkuODI2NCAxNy40MDUgMTkuODc4NiAxNy4yNTE5IDE5Ljg5MyAxNy4wOTNDMTkuOTA1NyAxNi45NTI1IDE5Ljg4ODYgMTYuODExMiAxOS44NDMgMTYuNjc4MkwxMi44NzUgNC40ODQxOEMxMi43ODg1IDQuMzI3ODggMTIuNjYxOCA0LjE5NzU1IDEyLjUwNzkgNC4xMDY4M0MxMi4zNTQxIDQuMDE2MTEgMTIuMTc4NyAzLjk2ODI2IDEyLjAwMDEgMy45NjgyNkMxMS44MjE0IDMuOTY4MjYgMTEuNjQ2MSA0LjAxNjExIDExLjQ5MjIgNC4xMDY4M0MxMS4zMzgzIDQuMTk3NTUgMTEuMjExNSA0LjMyNzg0IDExLjEyNTEgNC40ODQxNEwxMS4xMTg0IDQuNDk2Mkw0LjE1NzE0IDE2LjY3ODJDNC4xMTE1MSAxNi44MTEyIDQuMDk0MzggMTYuOTUyNSA0LjEwNzEyIDE3LjA5M0M0LjEyMTUyIDE3LjI1MTkgNC4xNzM3MyAxNy40MDUgNC4yNTkzNyAxNy41Mzk1QzQuMzQ1MDEgMTcuNjc0MSA0LjQ2MTYgMTcuNzg2MyA0LjU5OTQgMTcuODY2NkM0LjczMzIxIDE3Ljk0NDYgNC44ODMyNCAxNy45OTA0IDUuMDM3NjcgMTguMDAwNVoiIGZpbGw9IiNFMTFENDgiLz4KPC9zdmc+Cg==';

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
   * See description in public component.
   */
  @Prop() iconGalleryScanningCompleted: string;

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
   * Dictates if Help Screens usage is allowed (turned on).
   */
  @Prop() allowHelpScreens: boolean = false;

  /**
   * See description in public component.
   */
  @Prop() allowHelpScreensFab: boolean = false;

  /**
   * See description in public component.
   */
  @Prop() allowHelpScreensOnboarding: boolean = false;

  /**
   * See description in public component.
   */
  @Prop() allowHelpScreensOnboardingPerpetuity: boolean = false;

  /**
   * See description in public component.
   */
  @Prop() helpScreensTooltipPauseTimeout: number = 15000;

  /**
   * Event containing boolean which used to check whether component is blocked.
   */
  @Event() block: EventEmitter<boolean>;

  /**
   * See event 'fatalError' in public component.
   */
  @Event() fatalError: EventEmitter<SDKError>;

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
   * See event 'scanAborted' in public component.
   */
  @Event() scanAborted: EventEmitter<null>;

  /**
   * Emitted when camera stream becomes active.
   */
  @Event() setIsCameraActive: EventEmitter<boolean>;

  componentDidLoad() {
    // Set `exportparts` attribute on root `mb-component` element to enable ::part() CSS customization
    GenericHelpers.setWebComponentParts(this.hostEl);

    const parts = GenericHelpers.getWebComponentParts(this.hostEl.shadowRoot);
    const exportedParts = GenericHelpers.getWebComponentExportedParts(this.hostEl.shadowRoot);

    this.hostEl.setAttribute('exportparts', parts.concat(exportedParts).join(', '));

    this.init();
  }

  componentDidUpdate() {
    this.init();
  }

  disconnectedCallback() {
    this.sdkService?.stopRecognition();
  }

  @Listen('keyup', { target: 'window' })
  handleKeyUp(ev: KeyboardEvent) {
    if (ev.key === 'Escape' || ev.code === 'Escape') {
      if (this.overlays.camera.visible && this.isCameraActive) {
        this.abortScan();
        this.handleSetIsCameraActive(false);
        this.clearIsCameraActive = true;
      }
    }
  }

  private handleSetIsCameraActive(isCameraActive: boolean) {
    this.isCameraActive = isCameraActive;
    this.clearIsCameraActive = false;
  }

  /**
   * Starts camera scan using camera overlay with usage instructions.
   */
  @Method()
  async startCameraScan() {
    this.startScanFromCamera();
  }

  /**
   * Starts image scan, emits results from provided file.
   *
   * @param file File to scan
   */
  @Method()
  async startImageScan(file: File) {
    this.startScanFromImage(file);
  }

  /**
   * Starts multi-side image scan, emits results from provided files.
   *
   * @param firstFile File to scan as first image
   * @param secondFile File to scan as second image
   */
  @Method()
  async startMultiSideImageScan(firstFile: File, secondFile: File) {
    this.startScanFromImageMultiSide(firstFile, secondFile)
  }

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
          this.apiProcessStatusState = 'NONE';
          this.apiProcessStatusVisible = false;
          this.stopRecognition();
          return;
        }

        this.apiProcessStatusState = state;
        this.apiProcessStatusVisible = true;

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
            this.galleryExperienceModalErrorWindowVisible = true;
          }
          else {
            this.galleryExperienceModalErrorWindowVisible = false;
            this.stopRecognition();
          }
        }
      }

      if (state === 'SUCCESS') {
        window.setTimeout(() => this.stopRecognition(), 400);
      }

      if (state === 'ERROR') {
        this.hideScanFromImageUi(false);
        this.clearInputImages();
      }
    }, 400);
  }

  async closeApiProcessStatus(restart: boolean = false): Promise<void> {
    window.setTimeout(() => {
      this.apiProcessStatusVisible = false;
      this.apiProcessStatusState = 'NONE';
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

  private async init() {
    if (!this.hideLoadingAndErrorUi) {
      this.showScreen('loading');
      this.showOverlay('');
    }

    if (this.blocked) {
      return;
    }

    const internetIsAvailable = navigator.onLine;

    if (!internetIsAvailable) {
      this.setFatalError(
        new SDKError({
          code: ErrorTypes.ErrorCodes.InternetNotAvailable,
          message: this.translationService.i('check-internet-connection').toString()
        })
      );
      return;
    }

    const hasMandatoryProperties = await this.checkInputProperties();

    if (!hasMandatoryProperties) {
      return;
    }

    const hasMandatoryCapabilities = await DeviceHelpers.checkMandatoryCapabilites();

    if (!hasMandatoryCapabilities) {
      this.setFatalError(new SDKError(ErrorTypes.componentErrors.browserNotSupported));
      return;
    }

    this.blocked = true;
    this.block.emit(true);

    const initEvent: EventReady | SDKError = await this.sdkService.initialize(this.licenseKey, {
      allowHelloMessage: this.allowHelloMessage,
      engineLocation: this.engineLocation,
      workerLocation: this.workerLocation,
      wasmType: Utils.getSDKWasmType(this.wasmType)
    });

    this.cameraExperience.showOverlay = this.sdkService.showOverlay;

    if (initEvent instanceof SDKError) {
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

      if (imageScanIsAvailable) {
        this.imageRecognitionType = this.sdkService.getScanFromImageType(this.recognizers, this.recognizerOptions);

        if (this.imageRecognitionType === ImageRecognitionType.SingleSide) {
          this.screens.processing.setAttribute('data-type', 'single-sinde');
        }

        if (this.imageRecognitionType === ImageRecognitionType.MultiSide) {
          this.screens.processing.setAttribute('data-type', 'multi-side');
        }
      }
      else {
        if (this.showActionLabels) {
          this.scanFromImageButton.label = this.translationService.i('action-message-image-not-supported').toString();
        }
      }
    }

    this.ready.emit(initEvent);
    this.blocked = false;
    this.block.emit(false);

    this.showScreen('action');

    if (this.enableDrag) {
      this.setDragAndDrop();
    }
  }

  private async flipCameraAction(): Promise<void> {
    await this.sdkService.flipCamera();
    const cameraFlipped = await this.sdkService.isCameraFlipped();
    this.cameraExperience.setCameraFlipState(cameraFlipped);
  }

  private async changeCameraDevice(camera: CameraEntry) {
    if (this.cameraChangeInProgress) {
      return;
    }

    this.cameraChangeInProgress = true;
    await this.sdkService.changeCameraDevice(camera.details);
    this.cameraChangeInProgress = false;
  }

  private async checkInputProperties(): Promise<boolean> {
    if (!this.licenseKey) {
      this.setFatalError(new SDKError(BlinkIDSDK.sdkErrors.licenseKeyMissing));
      return false;
    }

    // Recognizers
    const conclusion: CheckConclusion = this.sdkService.checkRecognizers(this.recognizers);

    if (!conclusion.status) {
      const fatalError = new SDKError({
        code: ErrorTypes.ErrorCodes.InvalidRecognizers,
        message: conclusion.message
      });

      this.setFatalError(fatalError);
      return false;
    }

    this.cameraExperience.type = this.sdkService.getDesiredCameraExperience(this.recognizers, this.recognizerOptions);
    return true;
  }

  private async startScanFromCamera() {
    const configuration: VideoRecognitionConfiguration = {
      recognizers: this.recognizers,
      successFrame: this.includeSuccessFrame,
      cameraFeed: this.videoElement,
      cameraId: this.cameraId
    };

    if (this.recognizerOptions && Object.keys(this.recognizerOptions).length > 0) {
      configuration.recognizerOptions = this.recognizerOptions;
    }

    if (this.recognitionTimeout && typeof this.recognitionTimeout === 'number') {
      configuration.recognitionTimeout = this.recognitionTimeout;
    }

    this.isBackSide = false;

    const eventHandler = (recognitionEvent: RecognitionEvent) => {
      switch (recognitionEvent.status) {
        case RecognitionStatus.Preparing:
          this.feedback.emit({
            code: FeedbackCode.ScanStarted,
            state: 'FEEDBACK_OK',
            message: ''
          });
          this.showOverlay('camera');
          this.cameraExperience.setState(CameraExperienceState.Default);
          break;

        case RecognitionStatus.Ready:
          this.cameraExperience.setActiveCamera(this.sdkService.videoRecognizer.deviceId);
          break;

        case RecognitionStatus.Processing:
          // Just keep working
          break;

        case RecognitionStatus.EmptyResultState:
          if (!recognitionEvent.data.initiatedByUser) {
            this.scanError.emit({
              code: Code.EmptyResult,
              fatal: false,
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

        case RecognitionStatus.BarcodeScanningStarted:
          this.cameraExperience.setState(CameraExperienceState.BarcodeScanning, this.isBackSide, true)
            .then(() => {
              this.cameraExperience.setState(CameraExperienceState.Default, this.isBackSide);
            });
          break;

        case RecognitionStatus.DocumentClassified:
          this.cameraExperience.setState(CameraExperienceState.Classification);
          break;

        case RecognitionStatus.OnFirstSideResult:
          this.sdkService.videoRecognizer.pauseRecognition();

          window.setTimeout(async () => {
            if (this.areHelpScreensOpen) {
              return; // help screens close will resume
            }
            await this.sdkService.videoRecognizer.resumeRecognition(false);
          }, this.recognitionPauseTimeout);

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
          /* Which recognizer is it? ImageCapture or some other?
           *
           * ImageCapture has the 'imageCapture' flag set to true, we do not want to close camera overlay after image
           * acquisition process is finished. Cause maybe backend service will failed and we can press retry to resume
           * with the same video recognizer and try again
           */
          if (!recognitionEvent.data.imageCapture) {
            this.cameraExperience.setState(CameraExperienceState.DoneAll, false, true)
              .then(() => {
                this.cameraExperience.resetState();
                this.terminateHelpScreens();
                this.cameraExperience.classList.add('hide');

                this.scanSuccess.emit(recognitionEvent.data?.result);
                this.feedback.emit({
                  code: FeedbackCode.ScanSuccessful,
                  state: 'FEEDBACK_OK',
                  message: ''
                });

                this.showOverlay('');
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

      void this.cameraExperience.populateCameraDevices();
      await this.sdkService.scanFromCamera(configuration, eventHandler);

      const cameraFlipped = this.sdkService.isCameraFlipped();
      this.cameraExperience.setCameraFlipState(cameraFlipped);

      this.initializeHelpScreensAndStartOnboarding();
    } catch (error) {
      this.handleScanError(error);
      this.showOverlay('');
    }
  }

  private async startScanFromImage(file?: File) {
    const configuration: ImageRecognitionConfiguration = {
      recognizers: this.recognizers,
      file: file || this.scanFromImageInput.files[0]
    };

    if (this.recognizerOptions && Object.keys(this.recognizerOptions).length > 0) {
      configuration.recognizerOptions = this.recognizerOptions;
    }

    const eventHandler = (recognitionEvent: RecognitionEvent) => {
      switch (recognitionEvent.status) {
        case RecognitionStatus.Preparing:
          this.feedback.emit({
            code: FeedbackCode.ScanStarted,
            state: 'FEEDBACK_OK',
            message: ''
          });
          this.showScanFromImageUi();
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
          this.hideScanFromImageUi(false);
          this.clearInputImages();
          break;

        case RecognitionStatus.DetectionFailed:
          // Do nothing, RecognitionStatus.EmptyResultState will handle negative outcome
          this.clearInputImages();
          break;

        case RecognitionStatus.EmptyResultState:
          this.scanError.emit({
            code: Code.EmptyResult,
            fatal: false,
            message: 'Could not extract information from image!',
            recognizerName: recognitionEvent.data.recognizerName
          });
          this.feedback.emit({
            code: FeedbackCode.ScanUnsuccessful,
            state: 'FEEDBACK_ERROR',
            message: this.translationService.i('feedback-scan-unsuccessful').toString()
          });
          this.hideScanFromImageUi(false);
          this.clearInputImages();
          break;

        case RecognitionStatus.UnknownError:
          // Do nothing, RecognitionStatus.EmptyResultState will handle negative outcome
          this.clearInputImages();
          break;

        case RecognitionStatus.ScanSuccessful:
          this.scanSuccess.emit(recognitionEvent.data);
          this.feedback.emit({
            code: FeedbackCode.ScanSuccessful,
            state: 'FEEDBACK_OK',
            message: ''
          });
          this.clearInputImages();

          if (!recognitionEvent.data.imageCapture) {
            this.hideScanFromImageUi(true);
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
      this.handleScanError(error);
      this.hideScanFromImageUi(false);
    }
  }

  private async startScanFromImageMultiSide(firstFile?: File, secondFile?: File) {
    const configuration: MultiSideImageRecognitionConfiguration = {
      recognizers: this.recognizers,
      firstFile: firstFile || this.galleryImageFirstFile,
      secondFile: secondFile || this.galleryImageSecondFile
    };

    if (this.recognizerOptions) {
      configuration.recognizerOptions = this.recognizerOptions;
    }

    const eventHandler = (recognitionEvent: RecognitionEvent) => {
      switch (recognitionEvent.status) {
        case RecognitionStatus.Preparing:
          this.showScanFromImageUi();
          this.feedback.emit({
            code: FeedbackCode.ScanStarted,
            state: 'FEEDBACK_OK',
            message: ''
          });
          break;

        case RecognitionStatus.Ready:
          this.cameraExperience.setActiveCamera(this.sdkService.videoRecognizer.deviceId);
          break;

        case RecognitionStatus.Processing:
          // Just keep working
          break;

        case RecognitionStatus.NoFirstImageFileFound:
          this.scanError.emit({
            code: Code.NoFirstImageFileFound,
            fatal: true,
            message: 'First image file is missing!',
            recognizerName: ''
          });
          this.feedback.emit({
            code: FeedbackCode.ScanUnsuccessful,
            state: 'FEEDBACK_ERROR',
            message: this.translationService.i('feedback-scan-unsuccessful').toString()
          });
          this.hideScanFromImageUi(false);
          this.clearInputImages();
          break;

        case RecognitionStatus.NoSecondImageFileFound:
          this.scanError.emit({
            code: Code.NoSecondImageFileFound,
            fatal: true,
            message: 'Second image file is missing!',
            recognizerName: ''
          });
          this.feedback.emit({
            code: FeedbackCode.ScanUnsuccessful,
            state: 'FEEDBACK_ERROR',
            message: this.translationService.i('feedback-scan-unsuccessful').toString()
          });
          this.hideScanFromImageUi(false);
          this.clearInputImages();
          break;

        case RecognitionStatus.DetectionFailed:
          // Do nothing, RecognitionStatus.EmptyResultState will handle negative outcome
          this.clearInputImages();
          break;

        case RecognitionStatus.EmptyResultState:
          this.scanError.emit({
            code: Code.EmptyResult,
            fatal: false,
            message: 'Could not extract information from image!',
            recognizerName: recognitionEvent.data.recognizerName
          });
          this.feedback.emit({
            code: FeedbackCode.ScanUnsuccessful,
            state: 'FEEDBACK_ERROR',
            message: this.translationService.i('feedback-scan-unsuccessful').toString()
          });
          this.hideScanFromImageUi(false);
          this.clearInputImages();
          break;

        case RecognitionStatus.UnknownError:
          // Do nothing, RecognitionStatus.EmptyResultState will handle negative outcome
          this.clearInputImages();
          break;

        case RecognitionStatus.ScanSuccessful:
          this.scanSuccess.emit(recognitionEvent.data);
          this.feedback.emit({
            code: FeedbackCode.ScanSuccessful,
            state: 'FEEDBACK_OK',
            message: ''
          });
          this.clearInputImages();

          if (!recognitionEvent.data.imageCapture) {
            this.hideScanFromImageUi(true);
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

      await this.sdkService.scanFromImageMultiSide(configuration, eventHandler);
    } catch (error) {
      this.handleScanError(error);
      this.hideScanFromImageUi(false);
    }
  }

  private handleScanError(error: any) {
    const isAvailable = navigator.onLine;

    if (!isAvailable) {
      const fatalError = new SDKError({
        code: ErrorTypes.ErrorCodes.InternetNotAvailable,
        message: this.translationService.i('check-internet-connection').toString()
      });

      this.setFatalError(fatalError);
      this.showLicenseInfoModal(
        this.translationService.i('check-internet-connection').toString()
      );

      return;
    }

    if (error?.code === BlinkIDSDK.ErrorCodes.LICENSE_UNLOCK_ERROR) {
      this.setFatalError(new SDKError(ErrorTypes.componentErrors.licenseError, error));
      this.showLicenseInfoModal(error);
    }
    else {
      this.scanError.emit({
        code: Code.GenericScanError,
        fatal: true,
        message: 'There was a problem during scan action.',
        recognizerName: '',
        details: error
      });
      this.feedback.emit({
        code: FeedbackCode.GenericScanError,
        state: 'FEEDBACK_ERROR',
        message: this.translationService.i('feedback-error-generic').toString()
      });

      this.showOverlay('');
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
    const dropTarget = this.galleryDropType === 'FULLSCREEN' ? window : this.hostEl;
    const lockTimeout = 3000;
    let lockDragAndDrop = false;

    if (this.galleryDropType === 'INLINE') {
      this.overlays.draganddrop.classList.add('inline');
    }

    const closeOverlay = () => {
      if (lockDragAndDrop) {
        window.setTimeout(() => {
          this.hostEl.style.borderStyle = 'solid';
          this.overlays.draganddrop.classList.add('hidden')
          this.showOverlay('');

          window.setTimeout(() => {
            this.overlays.draganddrop.classList.remove('hidden')
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

    dropTarget.addEventListener('dragenter', (ev: any) => {
      ev.stopPropagation();
      ev.preventDefault();

      if (!this.scanFromImageButton.visible) {
        return;
      }

      this.hostEl.style.borderStyle = 'none';
    });

    dropTarget.addEventListener('dragover', (ev: any) => {
      ev.stopPropagation();
      ev.preventDefault();

      if (!this.scanFromImageButton.visible) {
        return;
      }

      this.hostEl.style.borderStyle = 'none';

      this.overlays.draganddrop.classList.remove('error');
      this.overlays.draganddrop.querySelector('img').src = this.iconDragAndDropGalleryDefault;
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
        this.startScanFromImage(ev.dataTransfer.files[0]);
      } else {
        this.overlays.draganddrop.classList.add('error');
        this.overlays.draganddrop.querySelector('p').innerText = this.translationService.i('drop-error').toString();
        this.overlays.draganddrop.querySelector('img').src = this.iconDragAndDropWarningDefault;

        lockDragAndDrop = true;
        window.setTimeout(() => {
          lockDragAndDrop = false
        }, lockTimeout);
      }

      closeOverlay();
    });
  }

  private setFatalError(error: SDKError) {
    this.fatalError.emit(error);

    if (this.hideLoadingAndErrorUi) {
      return;
    }

    if (error.details) {
      switch (error.details?.code) {
        case BlinkIDSDK.ErrorCodes.LICENSE_UNLOCK_ERROR:
          const licenseErrorType = error.details?.type;

          switch (licenseErrorType) {
            case BlinkIDSDK.LicenseErrorType.NetworkError:
              this.errorMessage.innerText = this.translationService.i('network-error').toString();
              break;

            default:
              this.errorMessage.innerText = this.translationService.i('scanning-not-available').toString();
          }
          break;

        default:
          // Do nothing
      }
    }
    else {
      this.errorMessage.innerText = error.message;
    }

    this.showScreen('error');
    this.showOverlay('');
  }

  private abortScan() {
    this.scanAborted.emit();
    this.stopRecognition();
  }

  private stopRecognition() {
    this.terminateHelpScreens();
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
    this.galleryExperienceModalErrorWindowVisible = false;
    this.stopRecognition();
  }

  private onFromImageClicked(): void {
    if (this.imageRecognitionType === ImageRecognitionType.SingleSide) {
      this.scanFromImageInput.click();
    }

    if (this.imageRecognitionType === ImageRecognitionType.MultiSide) {
      if (this.multiSideGalleryOpened) {
        this.closeMultiSideGalleryUpload();
      }
      else {
        this.openMultiSideGalleryUpload();
      }
    }
  }

  private clearInputImages(): void {
    if (this.imageRecognitionType === ImageRecognitionType.SingleSide) {
      this.scanFromImageInput.value = '';
    }

    if (this.imageRecognitionType === ImageRecognitionType.MultiSide) {
      this.imageBoxFirst.clear();
      this.imageBoxSecond.clear();
    }
  }

  private openMultiSideGalleryUpload(): void {
    const dialog = this.screens.action.querySelector('.multi-side-image-upload');
    dialog.classList.add('visible');

    this.scanFromImageButton.selected = true;
    this.multiSideGalleryOpened = true;

    this.overlays.draganddrop.classList.add('hidden')
  }

  private closeMultiSideGalleryUpload(): void {
    const dialog = this.screens.action.querySelector('.multi-side-image-upload');
    dialog.classList.remove('visible');

    this.scanFromImageButton.selected = false;
    this.multiSideGalleryOpened = false;

    this.overlays.draganddrop.classList.remove('hidden')
  }

  private async onMultiSideImageChange(ev: FileList, imageType: MultiSideImageType) {
    if (imageType === MultiSideImageType.First) {
      this.galleryImageFirstFile = GenericHelpers.getImageFile(ev);
    }

    if (imageType === MultiSideImageType.Second) {
      this.galleryImageSecondFile = GenericHelpers.getImageFile(ev);
    }

    // Enable scan button only if both images have values
    this.multiSideScanFromImageButton.disabled = this.galleryImageFirstFile === null || this.galleryImageSecondFile === null;
  }

  private showScanFromImageUi(): void {
    if (this.galleryOverlayType === 'INLINE') {
      const inProgress = this.screens.processing.querySelector('p.in-progress');
      const done = this.screens.processing.querySelector('p.done');

      inProgress.classList.add('visible');
      done.classList.remove('visible');

      this.showScreen('processing');
    }

    if (this.galleryOverlayType === 'FULLSCREEN') {
      this.showOverlay('processing');
    }
  }

  private hideScanFromImageUi(success: boolean): void {
    if (this.galleryOverlayType === 'INLINE') {
      let timeout = 0;

      const inProgress = this.screens.processing.querySelector('p.in-progress');
      const done = this.screens.processing.querySelector('p.done');

      inProgress.classList.remove('visible');

      if (success) {
        done.classList.add('visible');
        timeout = 1000;
      }

      window.setTimeout(() => this.showScreen('action'), timeout);
    }

    if (this.galleryOverlayType === 'FULLSCREEN') {
      this.showOverlay('');
    }
  }

  private terminateHelpScreens = async (): Promise<void> => {
    this.areHelpScreensOpen = false;
    await this.cameraExperience.terminateHelpScreens();
  };

  private initializeHelpScreensAndStartOnboarding = async (): Promise<void> => {
    this.areHelpScreensOpen = false;
    await this.cameraExperience.initializeHelpScreens({
      onOpen: () => {
        this.areHelpScreensOpen = true;
        this.sdkService.videoRecognizer.pauseRecognition();
      },
      onClose: () => {
        this.areHelpScreensOpen = false;
        this.sdkService.videoRecognizer.resumeRecognition(false);
      }
    } as MbHelpCallbacks);
    await this.cameraExperience.openHelpScreensOnboarding();
  }

  render() {
    return (
      <Host>
        {/* Loading screen */}
        <mb-screen
          id="mb-screen-loading"
          visible={!this.hideLoadingAndErrorUi}
          ref={el => this.screens.loading = el as HTMLMbScreenElement}
        >
          <mb-spinner icon={this.iconSpinnerScreenLoading}></mb-spinner>
        </mb-screen>

        {/* Error Screen */}
        <mb-screen
          id="mb-screen-error"
          visible={false}
          ref={el => this.screens.error = el as HTMLMbScreenElement}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" fill="#6B7280"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 7C12.5523 7 13 7.44772 13 8V12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12V8C11 7.44772 11.4477 7 12 7Z" fill="#6B7280"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11 16C11 15.4477 11.4477 15 12 15H12.01C12.5623 15 13.01 15.4477 13.01 16C13.01 16.5523 12.5623 17 12.01 17H12C11.4477 17 11 16.5523 11 16Z" fill="#6B7280"/>
          </svg>
          <p ref={el => this.errorMessage = el as HTMLParagraphElement}></p>
        </mb-screen>

        {/* Main action screen */}
        <mb-screen
          id="mb-screen-action"
          visible={false}
          ref={el => this.screens.action = el as HTMLMbScreenElement}
        >
          <div class="actions">
            <p class="action-label">{this.translationService.i('action-message').toString()}</p>
            <div class="action-buttons">
              <mb-button
                ref={el => this.scanFromCameraButton = el as HTMLMbButtonElement}
                visible={true}
                disabled={false}
                clickHandler={() => this.startScanFromCamera()}
                imageSrcDefault={this.iconCameraDefault}
                imageSrcActive={this.iconCameraActive}
                buttonTitle={this.translationService.i('action-alt-camera') as string}
              >
              </mb-button>
              <input
                tabindex="-1"
                id="scan-from-image-input"
                ref={el => this.scanFromImageInput = el as HTMLInputElement}
                type="file"
                accept="image/*"
                onChange={() => this.scanFromImageInput.value && this.startScanFromImage()} />
              <mb-button
                ref={el => this.scanFromImageButton = el as HTMLMbButtonElement}
                disabled={false}
                visible={false}
                selected={false}
                clickHandler={() => this.onFromImageClicked()}
                imageSrcDefault={this.iconGalleryDefault}
                imageSrcActive={this.iconGalleryActive}
                buttonTitle={this.translationService.i('action-alt-gallery') as string}
              >
              </mb-button>
            </div>
          </div>

          {/* Multi-side image upload */}
          <div class="multi-side-image-upload">
            <div class="image-upload-row">
            <mb-image-box
              ref={el => this.imageBoxFirst = el as HTMLMbImageBoxElement}
              box-title={this.translationService.i('process-image-box-first').toString()}
              anchor-text={this.translationService.i('process-image-box-add').toString()}
              onImageChange={(ev: CustomEvent<FileList>) => this.onMultiSideImageChange(ev.detail, MultiSideImageType.First)}></mb-image-box>
            <mb-image-box
              ref={el => this.imageBoxSecond = el as HTMLMbImageBoxElement}
              box-title={this.translationService.i('process-image-box-second').toString()}
              anchor-text={this.translationService.i('process-image-box-add').toString()}
              onImageChange={(ev: CustomEvent<FileList>) => this.onMultiSideImageChange(ev.detail, MultiSideImageType.Second)}></mb-image-box>
            </div>
            <mb-button-classic
              ref={el => this.multiSideScanFromImageButton = el as HTMLMbButtonClassicElement}
              disabled={true}
              clickHandler={() => this.startScanFromImageMultiSide()}
            >{this.translationService.i('process-image-upload-cta').toString()}</mb-button-classic>
          </div>
        </mb-screen>

        {/* Processing screen */}
        <mb-screen
          id="mb-screen-processing"
          visible={false}
          ref={el => this.screens.processing = el as HTMLMbScreenElement}
        >
          <p class="in-progress">
            <mb-spinner icon={this.iconSpinnerScreenLoading}></mb-spinner>
            <span>{this.translationService.i('process-image-message-inline').toString()}</span>
          </p>
          <p class="done">
            <mb-completed icon={this.iconGalleryScanningCompleted}></mb-completed>
            <span>{this.translationService.i('process-image-message-inline-done').toString()}</span>
          </p>
        </mb-screen>

        {/* Drag and drop overlay */}
        <mb-overlay
          id="mb-overlay-drag-and-drop"
          visible={false}
          ref={el => this.overlays.draganddrop = el as HTMLMbOverlayElement}
        >
          <img class="drag-and-drop-icon" src={this.iconDragAndDropGalleryDefault} />
          <p class="drag-and-drop-message">Whoops, we don't support that image format. Please upload a JPEG or PNG file.</p>
          <div id="drag-and-drop-zone" ref={el => this.dragAndDropZone = el as HTMLDivElement}></div>
        </mb-overlay>

        {/* Gallery experience overlay */}
        <mb-overlay
          id="mb-overlay-gallery-experience"
          ref={el => this.overlays.processing = el as HTMLMbOverlayElement}
        >
          <mb-spinner icon={this.iconSpinnerFromGalleryExperience} size="large"></mb-spinner>
          <p>{this.translationService.i('process-image-message').toString()}</p>
          <mb-modal
            visible={this.galleryExperienceModalErrorWindowVisible}
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

        {/* Camera experience overlay */}
        <mb-overlay
          id="mb-overlay-camera-experience"
          visible={false}
          ref={el => this.overlays.camera = el as HTMLMbOverlayElement}
        >
          <div class="holder">
            <video
              part="mb-camera-video"
              ref={el => this.videoElement = el as HTMLVideoElement}
              playsinline
            ></video>
            <mb-camera-experience
              ref={el => this.cameraExperience = el as HTMLMbCameraExperienceElement}
              cameraExperienceStateDurations={this.cameraExperienceStateDurations}
              translationService={this.translationService}
              showScanningLine={this.showScanningLine}
              showCameraFeedbackBarcodeMessage={this.showCameraFeedbackBarcodeMessage}
              clear-is-camera-active={this.clearIsCameraActive}
              onClose={() => this.abortScan()}
              onFlipCameraAction={() => this.flipCameraAction()}
              onSetIsCameraActive={(ev: CustomEvent<boolean>) => this.handleSetIsCameraActive(ev.detail)}
              onChangeCameraDevice={(ev: CustomEvent<CameraEntry>) => this.changeCameraDevice(ev.detail)}
              allowHelpScreens={ this.allowHelpScreens }
              allowHelpScreensFab={ this.allowHelpScreensFab }
              allowHelpScreensOnboarding={ this.allowHelpScreensOnboarding }
              allowHelpScreensOnboardingPerpetuity={ this.allowHelpScreensOnboardingPerpetuity }
              helpScreensTooltipPauseTimeout={ this.helpScreensTooltipPauseTimeout }
              class="overlay-camera-element"
            ></mb-camera-experience>
            <mb-api-process-status
              visible={this.apiProcessStatusVisible}
              state={this.apiProcessStatusState}
              translationService={this.translationService}
              onCloseTryAgain={() => this.closeApiProcessStatus(true)}
              onCloseFromStart={() => this.stopRecognition()}
            ></mb-api-process-status>
          </div>
        </mb-overlay>
        <mb-overlay
          id="mb-overlay-modal"
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
              >{this.translationService.i('modal-window-close').toString()}</button>
            </div>
          </mb-modal>
        </mb-overlay>
      </Host>
    );
  }
}
