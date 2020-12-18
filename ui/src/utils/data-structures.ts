/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { EventEmitter } from '@stencil/core';

import * as BlinkIDSDK from "../../../es/blinkid-sdk";

export interface MicroblinkUI {
  // SDK settings
  allowHelloMessage:    boolean;
  engineLocation:       string;
  licenseKey:           string;
  rawRecognizers:       string;
  recognizers:          Array<string>;
  rawRecognizerOptions: string;
  recognizerOptions:    Array<string>;
  includeSuccessFrame?: boolean;

  // Functional properties
  enableDrag:            boolean;
  hideFeedback:          boolean;
  hideLoadingAndErrorUi: boolean;
  scanFromCamera:        boolean;
  scanFromImage:         boolean;

  // UI customization
  translations:         { [key: string]: string };
  rawTranslations:      string;
  iconCameraDefault:    string;
  iconCameraActive:     string;
  iconGalleryDefault:   string;
  iconGalleryActive:    string;
  iconInvalidFormat:    string;
  iconSpinner:          string;

  // Events
  fatalError:         EventEmitter<EventFatalError>;
  ready:              EventEmitter<EventReady>;
  scanError:          EventEmitter<EventScanError>;
  scanSuccess:        EventEmitter<EventScanSuccess>;

  // Methods
  setUiState:         (state: 'ERROR' | 'LOADING' | 'NONE' | 'SUCCESS') => Promise<any>;
  setUiMessage:       (state: 'FEEDBACK_ERROR' | 'FEEDBACK_INFO' | 'FEEDBACK_OK', message: string) => Promise<any>;
}

export interface SdkSettings {
  allowHelloMessage:  boolean;
  engineLocation:     string;
}

/**
 * Events
 */
export class EventFatalError {
  code:     Code;
  message:  string;
  details?: any;

  constructor(code: Code, message: string, details?: any) {
    this.code = code;
    this.message = message;

    if (details) {
      this.details = details;
    }
  }
}

export class EventReady {
  sdk: BlinkIDSDK.WasmSDK;

  constructor(sdk: BlinkIDSDK.WasmSDK) {
    this.sdk = sdk;
  }
}

export class EventScanError {
  code:     Code;
  fatal:    boolean;
  message:  string;

  constructor(code: Code, fatal: boolean, message: string) {
    this.code = code;
    this.fatal = fatal;
    this.message = message;
  }
}

export class EventScanSuccess {
  recognizer:     BlinkIDSDK.RecognizerResult;
  successFrame?:  BlinkIDSDK.SuccessFrameGrabberRecognizerResult;

  constructor(
    recognizer: BlinkIDSDK.RecognizerResult,
    successFrame?: BlinkIDSDK.SuccessFrameGrabberRecognizerResult
  ) {
    this.recognizer = recognizer;

    if (successFrame) {
      this.successFrame = successFrame;
    }
  }
}

export interface RecognitionResults {
  recognizer: BlinkIDSDK.RecognizerResult,
  successFrame?: BlinkIDSDK.SuccessFrameGrabberRecognizerResult
}

/**
 * Error codes
 */
export enum Code {
  BrowserNotSupported       = 'BROWSER_NOT_SUPPORTED',
  EmptyResult               = 'EMPTY_RESULT',
  InvalidRecognizers        = 'INVALID_RECOGNIZERS',
  InvalidRecognizerOptions  = 'INVALID_RECOGNIZER_OPTIONS',
  MissingLicenseKey         = 'MISSING_LICENSE_KEY',
  NoImageFileFound          = 'NO_IMAGE_FILE_FOUND',
  SdkLoadFailed             = 'SDK_LOAD_FAILED',
  GenericScanError          = 'GENERIC_SCAN_ERROR',
  CameraNotAllowed          = 'CAMERA_NOT_ALLOWED',
  CameraInUse               = 'CAMERA_IN_USE',
  CameraGenericError        = 'CAMERA_GENERIC_ERROR',
  InternetNotAvailable      = 'INTERNET_NOT_AVAILABLE',
  LicenseError              = 'LICENSE_ERROR'
}

/**
 * Scan structures
 */
export const AvailableRecognizers: { [key: string]: string } = {
  IdBarcodeRecognizer:                  'createIdBarcodeRecognizer',
  BlinkIdRecognizer:                    'createBlinkIdRecognizer',
  BlinkIdCombinedRecognizer:            'createBlinkIdCombinedRecognizer',
}

export const AvailableRecognizerOptions: { [key: string]: Array<string> } = {
  IdBarcodeRecognizer:        [],
  BlinkIdRecognizer:          [
    'returnFullDocumentImage',
    'returnFaceImage',
    'returnSignatureImage',
    'classifierCallback'
  ],
  BlinkIdCombinedRecognizer:  [
    'returnFullDocumentImage',
    'returnFaceImage',
    'returnSignatureImage',
    'classifierCallback',
    'allowSignature'
  ],
}

export interface VideoRecognitionConfiguration {
  recognizers: Array<string>,
  recognizerOptions?: Array<string>,
  successFrame: boolean,
  cameraFeed: HTMLVideoElement,
  cameraId: string | null;
}

export interface ImageRecognitionConfiguration {
  recognizers: Array<string>,
  recognizerOptions?: Array<string>,
  fileList: FileList
}

export interface RecognizerInstance {
  recognizer: BlinkIDSDK.Recognizer & { objectHandle: number },
  successFrame?: BlinkIDSDK.SuccessFrameGrabberRecognizer<BlinkIDSDK.Recognizer> & { objectHandle?: number }
}

export enum RecognitionStatus {
  NoImageFileFound          = 'NoImageFileFound',
  Preparing                 = 'Preparing',
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
  recognizer: BlinkIDSDK.RecognizerResult,
  successFrame?: BlinkIDSDK.SuccessFrameGrabberRecognizerResult
}

export enum CameraExperience {
  Barcode         = 'BARCODE',
  CardCombined    = 'CARD_COMBINED',
  CardSingleSide  = 'CARD_SINGLE_SIDE'
}

export enum CameraExperienceState {
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

export const CameraExperienceStateDuration = new Map([
  [ CameraExperienceState.AdjustAngle, 2500 ],
  [ CameraExperienceState.Default, 500 ],
  [ CameraExperienceState.Done, 300 ],
  [ CameraExperienceState.DoneAll, 400 ],
  [ CameraExperienceState.Flip, 3500 ],
  [ CameraExperienceState.MoveCloser, 2000 ],
  [ CameraExperienceState.MoveFarther, 2000 ]
]);

export enum CameraExperienceReticleAnimation {
  Default,
  Detection,
  Classification
}

/**
 * User feedback structures
 */
export enum FeedbackCode {
  CameraDisabled      = 'CAMERA_DISABLED',
  CameraGenericError  = 'CAMERA_GENERIC_ERROR',
  CameraInUse         = 'CAMERA_IN_USE',
  CameraNotAllowed    = 'CAMERA_NOT_ALLOWED',
  GenericScanError    = 'GENERIC_SCAN_ERROR',
  ScanUnsuccessful    = 'SCAN_UNSUCCESSFUL',
  ScanSuccessful      = 'SCAN_SUCCESSFUL'
}

export interface FeedbackMessage {
  code?   : FeedbackCode;
  state   : 'FEEDBACK_ERROR' | 'FEEDBACK_INFO' | 'FEEDBACK_OK';
  message : string;
}
