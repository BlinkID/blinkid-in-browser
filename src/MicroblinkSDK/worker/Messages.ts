/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { CapturedFrame } from "../FrameCapture";
import { WasmSDKLoadSettings } from "../WasmLoadSettings";
import { WasmType } from "../WasmType";
import { SDKError } from "../SDKError";
import { ProductIntegrationInfo } from "../DataStructures";

let nextMessageID = 0;

function getNextMessageID()
{
    const msgId = nextMessageID;
    nextMessageID = nextMessageID + 1;
    return msgId;
}

// ===================================== /
// Request messages
// ===================================== /

export interface RequestMessage
{
    readonly action: string;
    readonly messageID: number;
}

export interface TransferrableMessage
{
    getTransferrables(): Array< Transferable >;
}

abstract class BaseRequestMessage implements RequestMessage
{
    readonly action: string;

    readonly messageID: number;

    protected constructor( action: string )
    {
        this.action = action;
        this.messageID = getNextMessageID();
    }
}

export class InitMessage extends BaseRequestMessage
{
    static readonly action: string = "init";

    readonly wasmModuleName: string;

    readonly licenseKey: string;

    readonly userId: string;

    readonly registerLoadCallback: boolean;

    readonly allowHelloMessage: boolean;

    readonly engineLocation: string;

    readonly wasmType: WasmType | null;

    readonly numberOfWorkers: number | null;

    constructor( wasmLoadSettings: WasmSDKLoadSettings, userId: string )
    {
        super( InitMessage.action );
        this.wasmModuleName = wasmLoadSettings.wasmModuleName;
        this.licenseKey = wasmLoadSettings.licenseKey;
        this.userId = userId;
        this.registerLoadCallback = wasmLoadSettings.loadProgressCallback !== null;
        this.allowHelloMessage = wasmLoadSettings.allowHelloMessage;
        this.engineLocation = wasmLoadSettings.engineLocation;
        this.wasmType = wasmLoadSettings.wasmType;
        this.numberOfWorkers = wasmLoadSettings.numberOfWorkers;
    }
}

export enum ParameterType
{
    Any,
    Recognizer,
    RecognizerSettings,
    Callback
}

export interface CallbackAddress
{
    readonly recognizerHandle: number;
    readonly callbackName: string;
}

export interface WrappedParameter
{
    parameter: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    type: ParameterType;
}

export class InvokeFunction extends BaseRequestMessage
{
    static readonly action: string = "invokeFunction";

    readonly funcName: string;

    readonly params: Array< WrappedParameter >;

    constructor( funcName: string, params: Array< WrappedParameter > )
    {
        super( InvokeFunction.action );
        this.funcName = funcName;
        this.params = params;
    }
}

export class CreateNewRecognizer extends BaseRequestMessage
{
    static readonly action: string = "createNewNativeObject";

    readonly className: string;

    readonly params: Array< WrappedParameter >;

    constructor( className: string, params: Array< WrappedParameter > )
    {
        super( CreateNewRecognizer.action );
        this.className = className;
        this.params = params;
    }
}

export class CreateRecognizerRunner extends BaseRequestMessage
{
    static readonly action: string = "createRecognizerRunner";

    readonly recognizerHandles: Array< number >;

    readonly allowMultipleResults: boolean;

    readonly registeredMetadataCallbacks: RegisteredMetadataCallbacks;

    constructor
    (
        recognizerHandles           : Array< number >,
        allowMultipleResults        : boolean,
        registeredMetadataCallbacks : RegisteredMetadataCallbacks
    )
    {
        super( CreateRecognizerRunner.action );
        this.recognizerHandles = recognizerHandles;
        this.allowMultipleResults = allowMultipleResults;
        this.registeredMetadataCallbacks = registeredMetadataCallbacks;
    }
}

export class ReconfigureRecognizerRunner extends BaseRequestMessage
{
    static readonly action: string = "reconfigureRecognizerRunner";

    readonly recognizerHandles: Array< number >;

    readonly allowMultipleResults: boolean;

    constructor( recognizerHandles: Array< number >, allowMultipleResults: boolean )
    {
        super( ReconfigureRecognizerRunner.action );
        this.recognizerHandles = recognizerHandles;
        this.allowMultipleResults = allowMultipleResults;
    }
}

export class DeleteRecognizerRunner extends BaseRequestMessage
{
    static readonly action: string = "deleteRecognizerRunner";

    constructor()
    {
        super( DeleteRecognizerRunner.action );
    }
}

export class InvokeObjectMethod extends BaseRequestMessage
{
    static readonly action: string = "invokeObject";

    readonly objectHandle: number;

    readonly methodName: string;

    readonly params: Array< WrappedParameter >;

    constructor( objectHandle: number, methodName: string, params: Array< WrappedParameter > )
    {
        super( InvokeObjectMethod.action );
        this.objectHandle = objectHandle;
        this.methodName = methodName;
        this.params = params;
    }
}

export class ProcessImage extends BaseRequestMessage implements TransferrableMessage
{
    static readonly action: string = "processImage";

    readonly frame: CapturedFrame;

    constructor( image: CapturedFrame )
    {
        super( ProcessImage.action );
        this.frame = image;
    }

    getTransferrables(): Array< Transferable >
    {
        return [ this.frame.imageData.data.buffer ];
    }
}

export class ResetRecognizers extends BaseRequestMessage
{
    static readonly action: string = "resetRecognizers";

    readonly hardReset: boolean;

    constructor( hardReset: boolean )
    {
        super( ResetRecognizers.action );
        this.hardReset = hardReset;
    }
}

export class RegisteredMetadataCallbacks
{
    onDebugText       = false;

    onDetectionFailed = false;

    onQuadDetection   = false;

    onPointsDetection = false;

    onFirstSideResult = false;

    onGlare           = false;
}

export class RegisterMetadataCallbacks extends BaseRequestMessage
{
    static readonly action: string = "registerMetadataCallbacks";

    readonly registeredMetadataCallbacks: RegisteredMetadataCallbacks;

    constructor( registeredMetadataCallbacks: RegisteredMetadataCallbacks )
    {
        super( RegisterMetadataCallbacks.action );
        this.registeredMetadataCallbacks = registeredMetadataCallbacks;
    }
}

export class SetDetectionOnly extends BaseRequestMessage
{
    static readonly action: string = "setDetectionOnly";

    readonly detectionOnlyMode: boolean;

    constructor( detectionOnlyMode: boolean )
    {
        super( SetDetectionOnly.action );
        this.detectionOnlyMode = detectionOnlyMode;
    }
}

export class SetClearTimeoutCallback extends BaseRequestMessage
{
    static readonly action: string = "setClearTimeoutCallback";

    readonly callbackNonEmpty: boolean;

    constructor( callbackNonEmpty: boolean )
    {
        super( SetClearTimeoutCallback.action );
        this.callbackNonEmpty = callbackNonEmpty;
    }
}

export class SetCameraPreviewMirrored extends BaseRequestMessage
{
    static readonly action: string = "setCameraPreviewMirrored";

    readonly cameraPreviewMirrored: boolean;

    constructor( cameraPreviewMirrored: boolean )
    {
        super( SetCameraPreviewMirrored.action );
        this.cameraPreviewMirrored = cameraPreviewMirrored;
    }
}

export class GetProductIntegrationInfo extends BaseRequestMessage
{
    static readonly action: string = "getProductIntegrationInfo";

    readonly userId: string;

    constructor( userId: string )
    {
        super( GetProductIntegrationInfo.action );
        this.userId = userId;
    }
}

// ===================================== /
// Response messages
// ===================================== /

export interface ResponseMessage
{
    readonly messageID: number;
}

export class StatusMessage implements ResponseMessage
{
    readonly messageID: number;

    readonly success: boolean = true;

    readonly error: SDKError | string | null = null;

    constructor( msgID: number, success: boolean, error: SDKError | string | null )
    {
        this.messageID = msgID;
        this.success = success;
        this.error = error;
    }
}

export class InitSuccessMessage implements ResponseMessage
{
    readonly messageID: number;

    readonly success: boolean = true;

    readonly showOverlay: boolean = true;

    readonly wasmType: WasmType;

    constructor( msgID: number, success: boolean, showOverlay: boolean, wasmType: WasmType )
    {
        this.messageID = msgID;
        this.success = success;
        this.showOverlay = showOverlay;
        this.wasmType = wasmType;
    }
}

/* eslint-disable @typescript-eslint/no-explicit-any,
                  @typescript-eslint/explicit-module-boundary-types,
                  @typescript-eslint/no-unsafe-assignment */
export class InvokeResultMessage extends StatusMessage
{
    readonly result: any;

    constructor( msgID: number, result: any )
    {
        super( msgID, true, null );
        this.result = result;
    }
}
/* eslint-enable @typescript-eslint/no-explicit-any,
                 @typescript-eslint/explicit-module-boundary-types,
                 @typescript-eslint/no-unsafe-assignment */

export class ObjectCreatedMessage extends StatusMessage
{
    readonly objectHandle: number;

    constructor( msgID: number, handle: number )
    {
        super( msgID, true, null );
        this.objectHandle = handle;
    }
}

export class ImageProcessResultMessage extends StatusMessage
{
    readonly recognitionState: number;

    constructor( msgID: number, recognitionState: number )
    {
        super( msgID, true, null );
        this.recognitionState = recognitionState;
    }
}

export class ProductIntegrationResultMessage extends StatusMessage
{
    readonly result: ProductIntegrationInfo;

    constructor( msgID: number, result: ProductIntegrationInfo )
    {
        super( msgID, true, null );
        this.result = result;
    }
}

// ===================================== /
// Load progress messages
// ===================================== /

export class LoadProgressMessage
{
    readonly isLoadProgressMessage = true;

    readonly progress: number;

    constructor( progress: number )
    {
        this.progress = progress;
    }
}


// ===================================== /
// Metadata callback messages
// ===================================== /

export enum MetadataCallback
{
    onDebugText,
    onDetectionFailed,
    onQuadDetection,
    onPointsDetection,
    onFirstSideResult,
    clearTimeoutCallback,
    onGlare,
    recognizerCallback
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class InvokeCallbackMessage
{
    readonly isCallbackMessage: boolean = true;

    readonly callbackType:      MetadataCallback;

    readonly callbackParameters: any[];

    constructor( callbackType: MetadataCallback, callbackParams: any[] )
    {
        this.callbackType       = callbackType;
        this.callbackParameters = callbackParams;
    }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
