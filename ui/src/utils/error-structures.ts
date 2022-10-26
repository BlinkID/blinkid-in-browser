/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/* eslint-disable max-len */

/**
 * Structures of Error Codes, Error Messages, and CustomError compatible objects for the Error Generator utility.
 * Error Code convention: SECTION_OBJECT_(ACTION)_PROBLEM
 */

export enum ErrorCodes {
  BrowserNotSupported       = 'BROWSER_NOT_SUPPORTED',
  LicenseError              = 'LICENSE_ERROR',
  SdkLoadFailed             = 'SDK_LOAD_FAILED',
  InternetNotAvailable      = 'INTERNET_NOT_AVAILABLE',
  InvalidRecognizers        = 'INVALID_RECOGNIZERS',
}


export enum ErrorMessages {
  BrowserNotSupported       = 'Browser is not supported!',
  LicenseError              = 'Something is wrong with the license.',
  SdkLoadFailed             = 'Failed to load SDK!',
}

export const componentErrors = {
  browserNotSupported: {
    code: ErrorCodes.BrowserNotSupported,
    message: ErrorMessages.BrowserNotSupported,
  },
  licenseError: {
    code: ErrorCodes.LicenseError,
    message: ErrorMessages.LicenseError,
  },
  sdkLoadFailed: {
    code: ErrorCodes.SdkLoadFailed,
    message: ErrorMessages.SdkLoadFailed,
  }
};
