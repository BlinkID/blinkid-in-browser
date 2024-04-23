/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { EventEmitter } from '@stencil/core';

import * as BlinkIDSDK from '@microblink/blinkid-in-browser-sdk';

export {
  ProductIntegrationInfo,
  SDKError
} from '@microblink/blinkid-in-browser-sdk';

export interface MicroblinkUI {
  // SDK settings
  allowHelloMessage:     boolean;
  engineLocation:        string;
  workerLocation:        string;
  licenseKey:            string;
  wasmType:              string;
  rawRecognizers:        string;
  recognizers:           Array<string>;
  recognizerOptions:     { [key: string]: any };
  recognitionTimeout?:   number;
  recognitionPauseTimeout?: number;
  blinkIdVariant?:       BlinkIDSDK.BlinkIDVariant;
  thoroughScanFromImage: boolean;

  // Functional properties
  enableDrag:            boolean;
  hideFeedback:          boolean;
  hideLoadingAndErrorUi: boolean;
  scanFromCamera:        boolean;
  scanFromImage:         boolean;

  // Localization
  translations:          { [key: string]: string };
  rawTranslations:       string;

  // UI customization
  galleryOverlayType:                'FULLSCREEN' | 'INLINE';
  galleryDropType:                   'FULLSCREEN' | 'INLINE';
  showActionLabels:                  boolean;
  showModalWindows:                  boolean;
  showScanningLine?:                 boolean;
  showCameraFeedbackBarcodeMessage?: boolean;

  // Icons
  iconCameraDefault:                string;
  iconCameraActive:                 string;
  iconGalleryDefault:               string;
  iconGalleryActive:                string;
  iconInvalidFormat:                string;
  iconSpinnerScreenLoading:         string;
  iconSpinnerFromGalleryExperience: string;
  iconGalleryScanningCompleted:     string;

  // Events
  fatalError:         EventEmitter<BlinkIDSDK.SDKError>;
  ready:              EventEmitter<EventReady>;
  scanError:          EventEmitter<EventScanError>;
  scanSuccess:        EventEmitter<EventScanSuccess>;
  cameraScanStarted:  EventEmitter<null>;
  imageScanStarted:   EventEmitter<null>;

  // Methods
  setUiState:                (state: 'ERROR' | 'LOADING' | 'NONE' | 'SUCCESS') => Promise<any>;
  setUiMessage:              (state: 'FEEDBACK_ERROR' | 'FEEDBACK_INFO' | 'FEEDBACK_OK', message: string) => Promise<any>;
  getProductIntegrationInfo: () => Promise<BlinkIDSDK.ProductIntegrationInfo>;
}

export interface SdkSettings {
  allowHelloMessage:  boolean;
  engineLocation:     string;
  workerLocation:     string;
  wasmType?:          BlinkIDSDK.WasmType;
  blinkIdVariant?:    BlinkIDSDK.BlinkIDVariant;
}

/**
 * Events
 */
export class EventReady {
  sdk: BlinkIDSDK.WasmSDK;

  constructor(sdk: BlinkIDSDK.WasmSDK) {
    this.sdk = sdk;
  }
}

export class EventScanError {
  code:           Code;
  fatal:          boolean;
  message:        string;
  recognizerName: string;
  details?:       any;

  constructor(code: Code, fatal: boolean, message: string, recognizerName: string, details?: any) {
    this.code = code;
    this.fatal = fatal;
    this.message = message;
    this.recognizerName = recognizerName;

    if (details) {
      this.details = details;
    }
  }
}

export class EventScanSuccess {
  recognizer:     BlinkIDSDK.RecognizerResult;
  recognizerName: string;

  constructor(
    recognizer: BlinkIDSDK.RecognizerResult,
    recognizerName: string,
  ) {
    this.recognizer = recognizer;
    this.recognizerName = recognizerName;

  }
}

export interface RecognitionResults {
  recognizer: BlinkIDSDK.RecognizerResult,
}

/**
 * Error codes
 */
export enum Code {
  EmptyResult               = 'EMPTY_RESULT',
  InvalidRecognizerOptions  = 'INVALID_RECOGNIZER_OPTIONS',
  NoImageFileFound          = 'NO_IMAGE_FILE_FOUND',
  NoFirstImageFileFound     = 'NO_FIRST_IMAGE_FILE_FOUND',
  NoSecondImageFileFound    = 'NO_SECOND_IMAGE_FILE_FOUND',
  GenericScanError          = 'GENERIC_SCAN_ERROR',
  CameraNotAllowed          = 'CAMERA_NOT_ALLOWED',
  CameraInUse               = 'CAMERA_IN_USE',
  CameraGenericError        = 'CAMERA_GENERIC_ERROR',
}

/**
 * Scan structures
 */
export const AvailableRecognizers: { [key: string]: string } = {
  IdBarcodeRecognizer:                  'createIdBarcodeRecognizer',
  BlinkIdSingleSideRecognizer:          'createBlinkIdSingleSideRecognizer',
  BlinkIdMultiSideRecognizer:           'createBlinkIdMultiSideRecognizer',
}

interface BaseRecognitionConfiguration {
  recognizers: Array<string>;
  recognizerOptions?: any;
  pingProxyUrl: string | null;
}

export interface VideoRecognitionConfiguration extends BaseRecognitionConfiguration {
  recognitionTimeout?: number;
  successFrame: boolean;
  cameraFeed: HTMLVideoElement;
  cameraId: string | null;
}

export interface ImageRecognitionConfiguration extends BaseRecognitionConfiguration {
  thoroughScan?: boolean;
  file: File;
}

export interface MultiSideImageRecognitionConfiguration extends BaseRecognitionConfiguration {
  thoroughScan?: boolean;
  firstFile: File;
  secondFile: File;
}

export enum ImageRecognitionType {
  SingleSide = 'SingleSide',
  MultiSide  = 'MultiSide'
}

export enum MultiSideImageType {
  First  = 'First',
  Second = 'Second'
}

export interface RecognizerInstance {
  name: string,
  recognizer: BlinkIDSDK.Recognizer & { objectHandle: number },
}

export enum RecognitionStatus {
  NoImageFileFound          = 'NoImageFileFound',
  NoFirstImageFileFound     = 'NoFirstImageFileFound',
  NoSecondImageFileFound    = 'NoSecondImageFileFound',
  Preparing                 = 'Preparing',
  Ready                     = 'Ready',
  Processing                = 'Processing',
  DetectionFailed           = 'DetectionFailed',
  EmptyResultState          = 'EmptyResultState',
  OnFirstSideResult         = 'OnFirstSideResult',
  ScanSuccessful            = 'ScanSuccessful',
  DocumentClassified        = 'DocumentClassified',

  // Camera states
  DetectionStatusChange     = 'DetectionStatusChange',
  NoSupportForMediaDevices  = 'NoSupportForMediaDevices',
  CameraNotFound            = 'CameraNotFound',
  CameraNotAllowed          = 'CameraNotAllowed',
  UnableToAccessCamera      = 'UnableToAccessCamera',
  CameraInUse               = 'CameraInUse',
  CameraGenericError        = 'CameraGenericError',

  // Errors
  UnknownError              = 'UnknownError',

  BarcodeScanningStarted    = 'BarcodeScanningStarted',

  // BlinkIDSDK.DetectionStatus
  DetectionStatusFail                   = 'Fail',
  DetectionStatusSuccess                = 'Success',
  DetectionStatusCameraTooHigh          = 'CameraTooHigh',
  DetectionStatusFallbackSuccess        = 'FallbackSuccess',
  DetectionStatusPartial                = 'Partial',
  DetectionStatusCameraAtAngle          = 'CameraAtAngle',
  DetectionStatusCameraTooNear          = 'CameraTooNear',
  DetectionStatusDocumentTooCloseToEdge = 'DocumentTooCloseToEdge'
}

export interface RecognitionEvent {
  status: RecognitionStatus,
  data?: any
}

export interface RecognitionResults {
  recognizer:        BlinkIDSDK.RecognizerResult,
  recognizerName:    string,
  imageCapture?:     boolean,
  resultSignedJSON?: BlinkIDSDK.SignedPayload
}

export enum CameraExperience {
  Barcode         = 'BARCODE',
  CardMultiSide   = 'CARD_MULTI_SIDE',
  CardSingleSide  = 'CARD_SINGLE_SIDE',
  PaymentCard     = 'PAYMENT_CARD'
}

export enum CameraExperienceState {
  BarcodeScanning = 'BarcodeScanning',
  AdjustAngle     = 'AdjustAngle',
  Classification  = 'Classification',
  Default         = 'Default',
  Detection       = 'Detection',
  Done            = 'Done',
  DoneAll         = 'DoneAll',
  Flip            = 'Flip',
  MoveCloser      = 'MoveCloser',
  MoveFarther     = 'MoveFarther'
}

export interface CameraExperienceTimeoutDurations {
  barcodeScanning: number,
  adjustAngle: number,
  default: number,
  done: number,
  doneAll: number,
  flip: number,
  moveCloser: number,
  moveFarther: number
}

export const CameraExperienceStateDuration = new Map([
  [ CameraExperienceState.BarcodeScanning, 3500 ],
  [ CameraExperienceState.AdjustAngle, 2500 ],
  [ CameraExperienceState.Default, 500 ],
  [ CameraExperienceState.Done, 300 ],
  [ CameraExperienceState.DoneAll, 400 ],
  [ CameraExperienceState.Flip, 3500 ],
  [ CameraExperienceState.MoveCloser, 2500 ],
  [ CameraExperienceState.MoveFarther, 2500 ]
]);

/**
 * User feedback structures
 */
export enum FeedbackCode {
  CameraDisabled      = 'CAMERA_DISABLED',
  CameraGenericError  = 'CAMERA_GENERIC_ERROR',
  CameraInUse         = 'CAMERA_IN_USE',
  CameraNotAllowed    = 'CAMERA_NOT_ALLOWED',
  GenericScanError    = 'GENERIC_SCAN_ERROR',
  ScanStarted         = 'SCAN_STARTED',
  ScanUnsuccessful    = 'SCAN_UNSUCCESSFUL',
  ScanSuccessful      = 'SCAN_SUCCESSFUL'
}

export interface FeedbackMessage {
  code?   : FeedbackCode;
  state   : 'FEEDBACK_ERROR' | 'FEEDBACK_INFO' | 'FEEDBACK_OK';
  message : string;
}

/**
 * Camera selection
 */
export interface CameraEntry {
  prettyName: string;
  details: BlinkIDSDK.SelectedCamera | null;
}
