/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/* eslint-disable max-len */

/**
 * Structures of Error Codes, Error Messages, and CustomError compatible objects for the Error Generator utility.
 * Error Code convention: SECTION_OBJECT_(ACTION)_PROBLEM
 */

export enum ErrorCodes {
    WORKER_WASM_LOAD_FAILURE           = "WORKER_WASM_LOAD_FAILURE",
    WORKER_WASM_INIT_MISSING           = "WORKER_WASM_INIT_MISSING",
    WORKER_FUNCTION_INVOKE_FAILURE     = "WORKER_FUNCTION_INVOKE_FAILURE",
    WORKER_RECOGNIZER_CREATION_FAILURE = "WORKER_RECOGNIZER_CREATION_FAILURE",
    WORKER_RUNNER_EXISTS               = "WORKER_RUNNER_EXISTS",
    WORKER_RUNNER_CREATION_FAILURE     = "WORKER_RUNNER_CREATION_FAILURE",
    WORKER_RUNNER_MISSING              = "WORKER_RUNNER_MISSING",
    WORKER_RUNNER_RECONFIGURE_FAILURE  = "WORKER_RUNNER_RECONFIGURE_FAILURE",
    WORKER_RUNNER_DELETED              = "WORKER_RUNNER_DELETED",
    WORKER_RUNNER_DELETE_FAILURE       = "WORKER_RUNNER_DELETE_FAILURE",
    WORKER_OBJECT_INVOKE_FAILURE       = "WORKER_OBJECT_INVOKE_FAILURE",
    WORKER_IMAGE_PROCESS_FAILURE       = "WORKER_IMAGE_PROCESS_FAILURE",
    WORKER_HANDLE_UNDEFINED            = "WORKER_HANDLE_UNDEFINED",
    WORKER_MESSAGE_ACTION_UNKNOWN      = "WORKER_MESSAGE_ACTION_UNKNOWN",
    WORKER_LICENSE_UNLOCK_ERROR        = "WORKER_LICENSE_UNLOCK_ERROR",
    WORKER_INTEGRATION_INFO_FAILURE    = "WORKER_INTEGRATION_INFO_FAILURE",

    LOCAL_SDK_RUNNER_MISSING = "LOCAL_SDK_RUNNER_MISSING",
    LOCAL_SDK_RUNNER_EMPTY   = "LOCAL_SDK_RUNNER_EMPTY",

    LICENSE_UNLOCK_ERROR = "LICENSE_UNLOCK_ERROR",

    FRAME_CAPTURE_SVG_UNSUPPORTED = "FRAME_CAPTURE_SVG_UNSUPPORTED",
    FRAME_CAPTURE_CANVAS_MISSING  = "FRAME_CAPTURE_CANVAS_MISSING",

    SDK_WASM_SETTINGS_MISSING    = "SDK_WASM_SETTINGS_MISSING",
    SDK_LICENSE_KEY_MISSING      = "SDK_LICENSE_KEY_MISSING",
    SDK_WASM_MODULE_NAME_MISSING = "SDK_WASM_MODULE_NAME_MISSING",
    SDK_ENGINE_LOCATION_INVALID  = "SDK_ENGINE_LOCATION_INVALID",
    SDK_WORKER_LOCATION_INVALID  = "SDK_WORKER_LOCATION_INVALID",
    SDK_MISSING                  = "SDK_MISSING",
    SDK_RECOGNIZERS_MISSING      = "SDK_RECOGNIZERS_MISSING",

    VIDEO_RECOGNIZER_ELEMENT_MISSING           = "VIDEO_RECOGNIZER_ELEMENT_MISSING",
    VIDEO_RECOGNIZER_CAMERA_MISSING            = "VIDEO_RECOGNIZER_CAMERA_MISSING",
    VIDEO_RECOGNIZER_CAMERA_NOT_ALLOWED        = "VIDEO_RECOGNIZER_CAMERA_NOT_ALLOWED",
    VIDEO_RECOGNIZER_CAMERA_UNAVAILABLE        = "VIDEO_RECOGNIZER_CAMERA_UNAVAILABLE",
    VIDEO_RECOGNIZER_CAMERA_IN_USE             = "VIDEO_RECOGNIZER_CAMERA_IN_USE",
    VIDEO_RECOGNIZER_MEDIA_DEVICES_UNSUPPORTED = "VIDEO_RECOGNIZER_MEDIA_DEVICES_UNSUPPORTED",
    VIDEO_RECOGNIZER_FEED_RELEASED             = "VIDEO_RECOGNIZER_FEED_RELEASED",
    VIDEO_RECOGNIZER_FEED_NOT_PAUSED           = "VIDEO_RECOGNIZER_FEED_NOT_PAUSED",
    VIDEO_RECOGNIZER_PLAY_REQUEST_INTERRUPTED  = "VIDEO_RECOGNIZER_PLAY_REQUEST_INTERRUPTED",
    VIDEO_RECOGNIZER_FEED_PAUSED               = "VIDEO_RECOGNIZER_FEED_PAUSED",
    VIDEO_RECOGNIZER_RECOGNIZERS_RESET_FAILURE = "VIDEO_RECOGNIZER_RECOGNIZERS_RESET_FAILURE",
    VIDEO_RECOGNIZER_FEED_MISSING              = "VIDEO_RECOGNIZER_FEED_MISSING",
}

export enum ErrorMessages {
    WORKER_HANDLE_UNDEFINED            = "Cannot find object with handle: undefined",
    WORKER_WASM_LOAD_FAILURE           = "Failed to load WASM in web worker!",
    WORKER_WASM_INIT_MISSING           = "WASM module is not initialized!",
    WORKER_FUNCTION_INVOKE_FAILURE     = "Failed to invoke function!",
    WORKER_RECOGNIZER_CREATION_FAILURE = "Failed to create new recognizer!",
    WORKER_RUNNER_EXISTS               = "Recognizer runner is already created! Multiple instances are not allowed!",
    WORKER_RUNNER_CREATION_FAILURE     = "Failed to create new recognizer runner!",
    WORKER_RUNNER_MISSING              = "Recognizer runner is not created! There is nothing to reconfigure!",
    WORKER_RUNNER_RECONFIGURE_FAILURE  = "Failed to reconfigure recognizer runner!",
    WORKER_RUNNER_DELETED              = "Recognizer runner is already deleted!",
    WORKER_RUNNER_DELETE_FAILURE       = "Failed to delete recognizer runner!",
    WORKER_OBJECT_INVOKE_FAILURE       = "Failed to invoke object!",
    WORKER_IMAGE_PROCESS_FAILURE       = "Recognizer runner is not initialized! Cannot process image!",
    WORKER_INTEGRATION_INFO_FAILURE    = "Failed to get product integration info!",

    LOCAL_SDK_RUNNER_MISSING = "Property nativeRecognizerRunner is not available!",
    LOCAL_SDK_RUNNER_EMPTY   = "Native RecognizerRunner cannot be empty!",

    LICENSE_TOKEN_STATE_INCORRECT       = "Internal error (Incorrect token state)",
    LICENSE_PAYLOAD_VERIFICATION_FAILED = "Failed to verify server permission's digital signature!",
    LICENSE_PAYLOAD_CORRUPTED           = "Server permission payload is corrupted!",
    LICENSE_PERMISSION_EXPIRED          = "Internal error (server permission expired)",
    LICENSE_REMOTE_LOCKED               = "Provided license key has been remotely locked. Please contact support for more information!",

    FRAME_CAPTURE_SVG_UNSUPPORTED = "Recognition of SVG elements not supported!",
    FRAME_CAPTURE_CANVAS_MISSING  = "Could not get canvas 2d context!",

    SDK_WASM_SETTINGS_MISSING    = "Missing WASM load settings!",
    SDK_LICENSE_KEY_MISSING      = "Missing license key!",
    SDK_WASM_MODULE_NAME_MISSING = "Missing WASM module name!",
    SDK_ENGINE_LOCATION_INVALID  = "Setting property 'engineLocation' must be a string!",
    SDK_WORKER_LOCATION_INVALID  = "Setting property 'workerLocation' must be a string!",
    SDK_MISSING                  = "SDK is not provided!",
    SDK_RECOGNIZERS_MISSING      = "To create RecognizerRunner at least 1 recognizer is required.",

    VIDEO_RECOGNIZER_ELEMENT_MISSING           = "Video element, i.e. camera feed is not provided!",
    VIDEO_RECOGNIZER_CAMERA_MISSING            = "Camera not found!",
    VIDEO_RECOGNIZER_CAMERA_NOT_ALLOWED        = "Camera not allowed!",
    VIDEO_RECOGNIZER_CAMERA_UNAVAILABLE        = "Camera not available!",
    VIDEO_RECOGNIZER_CAMERA_IN_USE             = "Camera in use!",
    VIDEO_RECOGNIZER_MEDIA_DEVICES_UNSUPPORTED = "Media devices not supported by browser.",
    VIDEO_RECOGNIZER_FEED_RELEASED             = "The associated video feed has been released!",
    VIDEO_RECOGNIZER_FEED_NOT_PAUSED           = "The associated video feed is not paused. Use resumeRecognition instead!",
    VIDEO_RECOGNIZER_PLAY_REQUEST_INTERRUPTED  = "The play() request was interrupted or prevented by browser security rules!",
    VIDEO_RECOGNIZER_FEED_PAUSED               = "Cannot resume recognition while video feed is paused! Use recognize or startRecognition",
    VIDEO_RECOGNIZER_RECOGNIZERS_RESET_FAILURE = "Could not reset recognizers!",
    VIDEO_RECOGNIZER_FEED_MISSING              = "Missing video feed!",
}

export const videoRecognizerErrors = {
    feedMissing: {
        message: ErrorMessages.VIDEO_RECOGNIZER_FEED_MISSING,
        code: ErrorCodes.VIDEO_RECOGNIZER_FEED_MISSING,
    },
    recognizersResetFailure: {
        message: ErrorMessages.VIDEO_RECOGNIZER_RECOGNIZERS_RESET_FAILURE,
        code: ErrorCodes.VIDEO_RECOGNIZER_RECOGNIZERS_RESET_FAILURE,
    },
    feedPaused: {
        message: ErrorMessages.VIDEO_RECOGNIZER_FEED_PAUSED,
        code: ErrorCodes.VIDEO_RECOGNIZER_FEED_PAUSED,
    },
    playRequestInterrupted: {
        message: ErrorMessages.VIDEO_RECOGNIZER_PLAY_REQUEST_INTERRUPTED,
        code: ErrorCodes.VIDEO_RECOGNIZER_PLAY_REQUEST_INTERRUPTED,
    },
    videoFeedNotPaused: {
        message: ErrorMessages.VIDEO_RECOGNIZER_FEED_NOT_PAUSED,
        code: ErrorCodes.VIDEO_RECOGNIZER_FEED_NOT_PAUSED,
    },
    videoFeedReleased: {
        message: ErrorMessages.VIDEO_RECOGNIZER_FEED_RELEASED,
        code: ErrorCodes.VIDEO_RECOGNIZER_FEED_RELEASED,
    },
    mediaDevicesUnsupported: {
        code: ErrorCodes.VIDEO_RECOGNIZER_MEDIA_DEVICES_UNSUPPORTED,
        message: ErrorMessages.VIDEO_RECOGNIZER_MEDIA_DEVICES_UNSUPPORTED,
    },
    cameraMissing: {
        code: ErrorCodes.VIDEO_RECOGNIZER_CAMERA_MISSING,
        message: ErrorMessages.VIDEO_RECOGNIZER_CAMERA_MISSING,
    },
    cameraNotAllowed: {
        code: ErrorCodes.VIDEO_RECOGNIZER_CAMERA_NOT_ALLOWED,
        message: ErrorMessages.VIDEO_RECOGNIZER_CAMERA_NOT_ALLOWED,
    },
    elementMissing: {
        message: ErrorMessages.VIDEO_RECOGNIZER_ELEMENT_MISSING,
        code: ErrorCodes.VIDEO_RECOGNIZER_ELEMENT_MISSING,
    },
};

export const sdkErrors = {
    wasmSettingsMissing: {
        message: ErrorMessages.SDK_WASM_SETTINGS_MISSING,
        code: ErrorCodes.SDK_WASM_SETTINGS_MISSING,
    },
    licenseKeyMissing: {
        message: ErrorMessages.SDK_LICENSE_KEY_MISSING,
        code: ErrorCodes.SDK_LICENSE_KEY_MISSING,
    },
    wasmModuleNameMissing: {
        message: ErrorMessages.SDK_WASM_MODULE_NAME_MISSING,
        code: ErrorCodes.SDK_WASM_MODULE_NAME_MISSING,
    },
    engineLocationInvalid: {
        message: ErrorMessages.SDK_ENGINE_LOCATION_INVALID,
        code: ErrorCodes.SDK_ENGINE_LOCATION_INVALID,
    },
    workerLocationInvalid: {
        message: ErrorMessages.SDK_WORKER_LOCATION_INVALID,
        code: ErrorCodes.SDK_WORKER_LOCATION_INVALID,
    },
    missing: {
        message: ErrorMessages.SDK_MISSING,
        code: ErrorCodes.SDK_MISSING,
    },
    recognizersMissing: {
        message: ErrorMessages.SDK_RECOGNIZERS_MISSING,
        code: ErrorCodes.SDK_RECOGNIZERS_MISSING,
    },
};

export const frameCaptureErrors = {
    svgUnsupported: {
        message: ErrorMessages.FRAME_CAPTURE_SVG_UNSUPPORTED,
        code: ErrorCodes.FRAME_CAPTURE_SVG_UNSUPPORTED,
    },
    canvasMissing: {
        message: ErrorMessages.FRAME_CAPTURE_CANVAS_MISSING,
        code: ErrorCodes.FRAME_CAPTURE_CANVAS_MISSING,
    },
};

export const licenseErrors = {
    licenseTokenStateIncorrect: {
        code: ErrorCodes.LICENSE_UNLOCK_ERROR,
        message: ErrorMessages.LICENSE_TOKEN_STATE_INCORRECT,
    },
    licensePayloadVerificationFailed: {
        code: ErrorCodes.LICENSE_UNLOCK_ERROR,
        message: ErrorMessages.LICENSE_PAYLOAD_VERIFICATION_FAILED,
    },
    licensePayloadCorrupted: {
        code: ErrorCodes.LICENSE_UNLOCK_ERROR,
        message: ErrorMessages.LICENSE_PAYLOAD_CORRUPTED,
    },
    licensePermissionExpired: {
        code: ErrorCodes.LICENSE_UNLOCK_ERROR,
        message: ErrorMessages.LICENSE_PERMISSION_EXPIRED,
    },
    licenseRemoteLocked: {
        code: ErrorCodes.LICENSE_UNLOCK_ERROR,
        message: ErrorMessages.LICENSE_REMOTE_LOCKED,
    },
    licenseNetworkError: {
        code: ErrorCodes.LICENSE_UNLOCK_ERROR,
    },
    licenseInvalid: {
        code: ErrorCodes.LICENSE_UNLOCK_ERROR,
    },
};

export const localSdkErrors = {
    runnerMissing: {
        message: ErrorMessages.LOCAL_SDK_RUNNER_MISSING,
        code: ErrorCodes.LOCAL_SDK_RUNNER_MISSING,
    },
    runnerEmpty: {
        message: ErrorMessages.LOCAL_SDK_RUNNER_EMPTY,
        code: ErrorCodes.LOCAL_SDK_RUNNER_EMPTY,
    },
};

export const workerErrors = {
    imageProcessFailure: {
        message: ErrorMessages.WORKER_IMAGE_PROCESS_FAILURE,
        code: ErrorCodes.WORKER_IMAGE_PROCESS_FAILURE,
    },
    objectInvokeFailure: {
        message: ErrorMessages.WORKER_OBJECT_INVOKE_FAILURE,
        code: ErrorCodes.WORKER_OBJECT_INVOKE_FAILURE,
    },
    runnerDeleteFailure: {
        message: ErrorMessages.WORKER_RUNNER_DELETE_FAILURE,
        code: ErrorCodes.WORKER_RUNNER_DELETE_FAILURE,
    },
    runnerDeleted: {
        message: ErrorMessages.WORKER_RUNNER_DELETED,
        code: ErrorCodes.WORKER_RUNNER_DELETED,
    },
    runnerReconfigureFailure: {
        message: ErrorMessages.WORKER_RUNNER_RECONFIGURE_FAILURE,
        code: ErrorCodes.WORKER_RUNNER_RECONFIGURE_FAILURE,
    },
    runnerMissing: {
        message: ErrorMessages.WORKER_RUNNER_MISSING,
        code: ErrorCodes.WORKER_RUNNER_MISSING,
    },
    runnerCreationFailure: {
        message: ErrorMessages.WORKER_RUNNER_CREATION_FAILURE,
        code: ErrorCodes.WORKER_RUNNER_CREATION_FAILURE,
    },
    runnerExists: {
        message: ErrorMessages.WORKER_RUNNER_EXISTS,
        code: ErrorCodes.WORKER_RUNNER_EXISTS,
    },
    recognizerCreationFailure: {
        message: ErrorMessages.WORKER_RECOGNIZER_CREATION_FAILURE,
        code: ErrorCodes.WORKER_RECOGNIZER_CREATION_FAILURE,
    },
    functionInvokeFailure: {
        message: ErrorMessages.WORKER_FUNCTION_INVOKE_FAILURE,
        code: ErrorCodes.WORKER_FUNCTION_INVOKE_FAILURE,
    },
    wasmInitMissing: {
        message: ErrorMessages.WORKER_WASM_INIT_MISSING,
        code: ErrorCodes.WORKER_WASM_INIT_MISSING,
    },
    wasmLoadFailure: {
        message: ErrorMessages.WORKER_WASM_LOAD_FAILURE,
        code: ErrorCodes.WORKER_WASM_LOAD_FAILURE,
    },
    handleUndefined: {
        message: ErrorMessages.WORKER_HANDLE_UNDEFINED,
        code: ErrorCodes.WORKER_HANDLE_UNDEFINED,
    },
    integrationInfoFailure: {
        message: ErrorMessages.WORKER_INTEGRATION_INFO_FAILURE,
        code: ErrorCodes.WORKER_INTEGRATION_INFO_FAILURE,
    },
};
