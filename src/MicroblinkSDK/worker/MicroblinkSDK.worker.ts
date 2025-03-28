/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import * as Messages from "./Messages";
import * as Utils from "../Utils";
import * as WasmLoadUtils from "../WasmLoadUtils";
import * as License from "../License";
import * as ErrorTypes from "../ErrorTypes";

import {
    MetadataCallbacks,
    DisplayablePoints,
    DisplayableQuad,
} from "../MetadataCallbacks";

import { convertEmscriptenStatusToProgress } from "../LoadProgressUtils";
import { WasmType } from "../WasmType";
import { SDKError, SerializableSDKError } from "../SDKError";
import { isMobile } from "is-mobile";
import { BlinkIDResource, BlinkIDVariant } from "../BlinkIdVariant";

interface MessageWithParameters extends Messages.RequestMessage {
    readonly params: Array<Messages.WrappedParameter>;
}

/**
 * This function converts megabytes to WebAssembly pages
 * @param mb - number of megabytes
 * @returns number of WebAssembly pages
 */
function mbToWasmPages( mb: number )
{
    return Math.ceil( mb * 1024 * 1024 / 64 / 1024 );
}

/**
 * Checks if the current environment is Safari browser.
 * @returns {boolean} True if running on Safari, false otherwise.
 */
function isSafari(): boolean
{
    const userAgent = self.navigator.userAgent.toLowerCase();
    return userAgent.includes( "safari" ) && !userAgent.includes( "chrome" );
}


// https://twitter.com/subzey/status/1711117272142471398/
// This is used as a "black hole" port to force GC of ImageData
// Works reliably on Chrome and Firefox, although it has a larger performance impact on Firefox
//
// CAUSES MEMORY LEAKS IN SAFARI!

const { port1, port2 } = new MessageChannel();
// "Black hole" port
port2.close();

if ( isSafari() )
{
    port1.close();
}

/**
 * This function returns the path to the resources variant
 * based on the user's device
 */
export function getBlinkIdVariant(): BlinkIDVariant
{
    // Mobile devices are more resource constrained so we don't ship highly intensive
    // deblurring models. Additionally it's not required as they have better cameras
    if ( isMobile() )
    {
        return "lightweight";
    }
    // Desktop browsers don't have issues with memory probing, so we ship a
    // regular version with memory growth.
    // As laptop cameras are often worse, we ship a deblurring model.
    else
    {
        return "full";
    }
}

export default class MicroblinkWorker
{
    /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                      @typescript-eslint/no-explicit-any */
    private context: Worker = self as any;

    private wasmModule: any = null;

    private nativeRecognizerRunner: any = null;

    private objects: { [key: number]: any } = {};

    private nextObjectHandle = 0;

    private metadataCallbacks: MetadataCallbacks = {};

    private lease?: number;

    private inFlightHeartBeatTimeoutId?: number;
    /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                     @typescript-eslint/no-explicit-any */

    constructor()
    {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                          @typescript-eslint/no-unsafe-member-access */
        this.context.onmessage = ( event: MessageEvent ) =>
        {
            const msg = event.data;
            switch ( msg.action )
            {
                case Messages.InitMessage.action:
                    void this.processInitMessage( msg as Messages.InitMessage );
                    break;
                case Messages.InvokeFunction.action:
                    this.processInvokeFunction( msg as Messages.InvokeFunction );
                    break;
                case Messages.CreateNewRecognizer.action:
                    this.processCreateNewRecognizer(
                        msg as Messages.CreateNewRecognizer,
                    );
                    break;
                case Messages.InvokeObjectMethod.action:
                    this.processInvokeObject(
                        msg as Messages.InvokeObjectMethod,
                    );
                    break;
                case Messages.CreateRecognizerRunner.action:
                    void this.processCreateRecognizerRunner(
                        msg as Messages.CreateRecognizerRunner,
                    );
                    break;
                case Messages.ReconfigureRecognizerRunner.action:
                    this.processReconfigureRecognizerRunner(
                        msg as Messages.ReconfigureRecognizerRunner,
                    );
                    break;
                case Messages.DeleteRecognizerRunner.action:
                    this.processDeleteRecognizerRunner(
                        msg as Messages.DeleteRecognizerRunner,
                    );
                    break;
                case Messages.ProcessImage.action:
                    void this.processImage( msg as Messages.ProcessImage );
                    break;
                case Messages.ResetRecognizers.action:
                    this.resetRecognizers( msg as Messages.ResetRecognizers );
                    break;
                case Messages.SetDetectionOnly.action:
                    this.setDetectionOnly( msg as Messages.SetDetectionOnly );
                    break;
                case Messages.SetCameraPreviewMirrored.action:
                    this.setCameraPreviewMirrored(
                        msg as Messages.SetCameraPreviewMirrored,
                    );
                    break;
                case Messages.RegisterMetadataCallbacks.action:
                    this.registerMetadataCallbacks(
                        msg as Messages.RegisterMetadataCallbacks,
                    );
                    break;
                case Messages.GetProductIntegrationInfo.action:
                    this.processGetProductIntegrationInfo(
                        msg as Messages.GetProductIntegrationInfo,
                    );
                    break;
                case Messages.SetPingProxyUrl.action:
                    this.setPingProxyUrl(
                        msg as Messages.SetPingProxyUrl
                    );
                    break;
                case Messages.SetPingData.action:
                    this.setPingData(
                        msg as Messages.SetPingData,
                    );
                    break;
                default:
                    throw new SDKError( {
                        code: ErrorTypes.ErrorCodes
                            .WORKER_MESSAGE_ACTION_UNKNOWN,
                        message:
                            "Unknown message action: " +
                            JSON.stringify( msg.action ),
                    } );
            }
        };
        /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                         @typescript-eslint/no-unsafe-member-access */
    }

    private getNextObjectHandle()
    {
        const handle = this.nextObjectHandle;
        this.nextObjectHandle = this.nextObjectHandle + 1;
        return handle;
    }

    private notifyError(
        originalMessage: Messages.RequestMessage,
        error: SerializableSDKError | string,
    )
    {
        this.context.postMessage(
            new Messages.StatusMessage( originalMessage.messageID, false, error ),
        );
    }

    private notifySuccess( originalMessage: Messages.RequestMessage )
    {
        this.context.postMessage(
            new Messages.StatusMessage( originalMessage.messageID, true, null ),
        );
    }

    private notifyInitSuccess(
        originalMessage: Messages.RequestMessage,
        showOverlay: boolean,
        wasmType: WasmType,
    )
    {
        this.context.postMessage(
            new Messages.InitSuccessMessage(
                originalMessage.messageID,
                true,
                showOverlay,
                wasmType,
            ),
        );
    }

    /* eslint-disable @typescript-eslint/no-explicit-any,
                      @typescript-eslint/no-unsafe-assignment,
                      @typescript-eslint/no-unsafe-member-access,
                      @typescript-eslint/no-unsafe-argument,
                      @typescript-eslint/no-unsafe-return */
    private unwrapParameters( msgWithParams: MessageWithParameters ): Array<any>
    {
        const params: Array<any> = [];
        for ( const wrappedParam of msgWithParams.params )
        {
            let unwrappedParam = wrappedParam.parameter;
            if ( wrappedParam.type === Messages.ParameterType.Recognizer )
            {
                unwrappedParam = this.objects[unwrappedParam];
                if ( unwrappedParam === undefined )
                {
                    this.notifyError(
                        msgWithParams,
                        new SerializableSDKError( ErrorTypes.workerErrors.handleUndefined ),
                    );
                }
            }
            else if (
                wrappedParam.type === Messages.ParameterType.RecognizerSettings
            )
            {
                // restore removed functions
                unwrappedParam = this.restoreFunctions( unwrappedParam );
            }
            params.push( unwrappedParam );
        }
        return params;
    }

    private restoreFunctions( settings: any ): any
    {
        const keys = Object.keys( settings );
        for ( const key of keys )
        {
            const data = settings[key];
            if (
                typeof data === "object" &&
                data !== null &&
                "parameter" in data &&
                "type" in data &&
                data.type === Messages.ParameterType.Callback
            )
            {
                settings[key] = ( ...args: any[] ): void =>
                {
                    const msg = new Messages.InvokeCallbackMessage(
                        Messages.MetadataCallback.recognizerCallback,
                        [data.parameter].concat( args ),
                    );
                    // TODO: scan for transferrables and transfer them, instead of copying
                    this.context.postMessage( msg );
                };
            }
        }
        return settings;
    }
    /* eslint-enable @typescript-eslint/no-explicit-any,
                     @typescript-eslint/no-unsafe-assignment,
                     @typescript-eslint/no-unsafe-member-access,
                     @typescript-eslint/no-unsafe-argument,
                     @typescript-eslint/no-unsafe-return */

    /* eslint-disable @typescript-eslint/no-explicit-any,
                      @typescript-eslint/no-unsafe-assignment,
                      @typescript-eslint/no-unsafe-argument,
                      @typescript-eslint/no-unsafe-member-access */
    private scanForTransferrables( object: any ): Array<Transferable>
    {
        if ( typeof object === "object" )
        {
            const keys = Object.keys( object );
            const transferrables: Array<Transferable> = [];

            for ( const key of keys )
            {
                const data = object[key];
                if ( data instanceof ImageData )
                {
                    transferrables.push( data.data.buffer );
                }
                else if ( data instanceof Uint8Array )
                {
                    transferrables.push( data.buffer );
                }
                else if ( data !== null && typeof data === "object" )
                {
                    transferrables.push( ...this.scanForTransferrables( data ) );
                }
            }
            return transferrables;
        }
        else
        {
            return [];
        }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any,
                     @typescript-eslint/no-unsafe-assignment,
                     @typescript-eslint/no-unsafe-argument,
                     @typescript-eslint/no-unsafe-member-access */

    private registerHeartBeat( lease: number )
    {
        // unregister any in-flight heartbeats
        this.unregisterHeartBeat();
        this.lease = lease;

        const currentTimestamp = Math.floor( Date.now() / 1000 );
        let heartBeatDelay = lease - currentTimestamp;
        if ( heartBeatDelay > 120 )
        {
            // if interval is larger than 2 minutes, register heartbeat at 2 minutes before expiry
            heartBeatDelay -= 120;
        }
        else
        {
            // otherwise, use half the delay
            heartBeatDelay /= 2;
        }
        this.inFlightHeartBeatTimeoutId = setTimeout( () =>
        {
            void this.obtainNewServerPermission( true );
        }, heartBeatDelay * 1000 );
    }

    private unregisterHeartBeat()
    {
        if ( this.lease ) delete this.lease;
        if ( this.inFlightHeartBeatTimeoutId )
        {
            clearTimeout( this.inFlightHeartBeatTimeoutId );
            delete this.inFlightHeartBeatTimeoutId;
        }
    }

    /* eslint-disable @typescript-eslint/no-unsafe-member-access,
                      @typescript-eslint/no-unsafe-call
    */
    private async obtainNewServerPermission(
        attemptOnNetworkError: boolean,
    ): Promise<License.ServerPermissionSubmitResultStatus>
    {
        if ( this.wasmModule )
        {
            const activeTokenInfo =
                this.wasmModule.getActiveLicenseTokenInfo() as License.LicenseUnlockResult;
            const unlockResult = await License.obtainNewServerPermission(
                activeTokenInfo,
                this.wasmModule,
            );
            switch ( unlockResult.status )
            {
                case License.ServerPermissionSubmitResultStatus.Ok:
                case License.ServerPermissionSubmitResultStatus.RemoteLock:
                    // register new heart beat
                    this.registerHeartBeat( unlockResult.lease );
                    break;
                case License.ServerPermissionSubmitResultStatus.NetworkError:
                case License.ServerPermissionSubmitResultStatus
                    .PayloadSignatureVerificationFailed:
                case License.ServerPermissionSubmitResultStatus
                    .PayloadCorrupted:
                    if ( attemptOnNetworkError )
                    {
                        console.warn(
                            "Problem with obtaining server permission. Will attempt in 10 seconds " +
                                License.ServerPermissionSubmitResultStatus[
                                    unlockResult.status
                                ],
                        );
                        // try again in 10 seconds
                        this.inFlightHeartBeatTimeoutId = setTimeout( () =>
                        {
                            void this.obtainNewServerPermission( false );
                        }, 10 * 1000 );
                    }
                    else
                    {
                        console.error(
                            "Problem with obtaining server permission. " +
                                License.ServerPermissionSubmitResultStatus[
                                    unlockResult.status
                                ],
                        );
                    }
                    break;
                case License.ServerPermissionSubmitResultStatus
                    .IncorrectTokenState: // should never happen
                case License.ServerPermissionSubmitResultStatus
                    .PermissionExpired: // should never happen
                    console.error(
                        "Internal error: " +
                            License.ServerPermissionSubmitResultStatus[
                                unlockResult.status
                            ],
                    );
                    break;
            }
            return unlockResult.status;
        }
        else
        {
            console.error(
                "Internal inconsistency! Wasm module not initialized where it's expected to be!",
            );
            return License.ServerPermissionSubmitResultStatus
                .IncorrectTokenState;
        }
    }

    private willSoonExpire(): boolean
    {
        if ( this.lease )
        {
            const tokenInfo =
                this.wasmModule.getActiveLicenseTokenInfo() as License.LicenseUnlockResult;

            if ( tokenInfo.unlockResult === License.LicenseTokenState.Valid )
            {
                const currentTimestamp = Math.floor( Date.now() / 1000 );
                const timeToExpiry = this.lease - currentTimestamp;

                return timeToExpiry < 30;
            }
            else
            {
                return true;
            }
        }
        else
        {
            return false;
        }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-member-access,
                     @typescript-eslint/no-unsafe-call
    */

    // message process functions

    private async calculateWasmBundle(
        msg: Messages.InitMessage,
    ): Promise<BlinkIDResource>
    {
        const blinkIDVariant = msg.blinkIDVariant ?? getBlinkIdVariant();
        const wasmType = msg.wasmType ?? ( await WasmLoadUtils.detectWasmType() );

        return {
            wasmType,
            blinkIDVariant,
        };
    }

    private calculateEngineLocationPrefix(
        msg: Messages.InitMessage,
        blinkIDResource: BlinkIDResource,
    ): string
    {
        const engineLocation =
            msg.engineLocation === ""
                ? self.location.origin
                : msg.engineLocation;

        console.log( "Engine location is:", engineLocation );

        const engineLocationPrefix = Utils.getSafePath(
            engineLocation,
            WasmLoadUtils.wasmFolder( blinkIDResource ),
        );

        if ( msg.allowHelloMessage )
        {
            console.log( "Engine location prefix is:", engineLocationPrefix );
        }
        return engineLocationPrefix;
    }

    /* eslint-disable @typescript-eslint/no-explicit-any,
                      @typescript-eslint/no-unsafe-assignment,
                      @typescript-eslint/no-unsafe-call,
                      @typescript-eslint/no-unsafe-member-access */
    private async processInitMessage( msg: Messages.InitMessage )
    {
        const wasmBundle = await this.calculateWasmBundle( msg );
        const engineLocation = this.calculateEngineLocationPrefix(
            msg,
            wasmBundle,
        );

        // See https://emscripten.org/docs/api_reference/module.html
        let module: any  = {
            locateFile: ( path: string ) =>
            {
                return Utils.getSafePath( engineLocation, path );
            },
            // don't automatically terminate WASM runtime after last native function is executed (e.g. async ping
            // after recognition is over) We need to manually call `mbWasmModule.exitRuntime()` when we are completely
            // done with all native processing
            noExitRuntime: true,
        };

        // memory override
        let initialMemory = msg.initialMemory;

        if ( !initialMemory )
        {
            // safari requires a larger initial memory allocation as it often block memory growth
            initialMemory = WasmLoadUtils.isIOSUserAgent() ? 700 : 200;
        }


        const wasmMemory = new WebAssembly.Memory( {
            initial: mbToWasmPages( initialMemory ),
            maximum: mbToWasmPages( 2048 ),
            shared: wasmBundle.wasmType === WasmType.AdvancedWithThreads,
        } );

        // initial memory in bytes
        // module["INITIAL_MEMORY"] = initialMemory * 1024 * 1024;
        module["wasmMemory"] = wasmMemory;

        if ( msg.registerLoadCallback )
        {
            module = Object.assign( module, {
                setStatus: ( text: string ) =>
                {
                    const msg = new Messages.LoadProgressMessage(
                        convertEmscriptenStatusToProgress( text ),
                    );
                    this.context.postMessage( msg );
                },
            } );
        }

        try
        {
            const jsName = msg.wasmModuleName + ".js";
            const jsPath = Utils.getSafePath( engineLocation, jsName );


            module.mainScriptUrlOrBlob = jsPath;

            importScripts( jsPath );

            const loaderFunc = ( self as { [key: string]: any } )[
                msg.wasmModuleName
            ];

            loaderFunc( module ).then(
                async ( mbWasmModule: any ) =>
                {
                    const licenseResult = await License.unlockWasmSDK(
                        msg.licenseKey,
                        msg.allowHelloMessage,
                        msg.userId,
                        mbWasmModule,
                    );
                    if ( licenseResult.error === null )
                    {
                        this.wasmModule = mbWasmModule;
                        if ( licenseResult.lease )
                        {
                            this.registerHeartBeat( licenseResult.lease );
                        }
                        else
                        {
                            this.unregisterHeartBeat();
                        }
                        this.notifyInitSuccess(
                            msg,
                            !!licenseResult.showOverlay,
                            wasmBundle.wasmType,
                        );
                    }
                    else
                    {
                        this.notifyError(
                            msg,
                            new SerializableSDKError( licenseResult.error, licenseResult.error.details )
                        );
                    }
                },
                ( error: any ) =>
                {
                    // Failed to load WASM in web worker due to error
                    this.notifyError(
                        msg,
                        new SerializableSDKError(
                            ErrorTypes.workerErrors.wasmLoadFailure,
                            error,
                        ),
                    );
                },
            );
        }
        catch ( error )
        {
            // Failed to load WASM in web worker due to error
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.wasmLoadFailure, error ),
            );
        }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any,
                     @typescript-eslint/no-unsafe-assignment,
                     @typescript-eslint/no-unsafe-call,
                     @typescript-eslint/no-unsafe-member-access */

    /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                      @typescript-eslint/no-unsafe-call,
                      @typescript-eslint/no-unsafe-member-access */
    private processInvokeFunction( msg: Messages.InvokeFunction ): void
    {
        if ( this.wasmModule === null )
        {
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.wasmInitMissing ),
            );
            return;
        }

        const funcName = msg.funcName;
        const params = this.unwrapParameters( msg );

        try
        {
            const invocationResult = this.wasmModule[funcName]( ...params );
            this.context.postMessage(
                new Messages.InvokeResultMessage(
                    msg.messageID,
                    invocationResult,
                ),
            );
        }
        catch ( error )
        {
            this.notifyError(
                msg,
                new SerializableSDKError(
                    ErrorTypes.workerErrors.functionInvokeFailure,
                    error,
                ),
            );
        }
    }

    private processCreateNewRecognizer( msg: Messages.CreateNewRecognizer )
    {
        if ( this.wasmModule === null )
        {
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.wasmInitMissing ),
            );
            return;
        }

        const className = msg.className;
        const params = this.unwrapParameters( msg );

        try
        {
            const createdObject = new this.wasmModule[className]( ...params );
            const newHandle = this.getNextObjectHandle();
            this.objects[newHandle] = createdObject;

            this.context.postMessage(
                new Messages.ObjectCreatedMessage( msg.messageID, newHandle ),
            );
        }
        catch ( error )
        {
            this.notifyError(
                msg,
                new SerializableSDKError(
                    ErrorTypes.workerErrors.recognizerCreationFailure,
                    error,
                ),
            );
        }
    }

    private getRecognizers( recognizerHandles: Array<number> ): Array<unknown>
    {
        const recognizers = [] as Array<unknown>;
        for ( const handle of recognizerHandles )
        {
            const recognizer = this.objects[handle];
            recognizers.push( recognizer );
        }
        return recognizers;
    }

    private async processCreateRecognizerRunner(
        msg: Messages.CreateRecognizerRunner,
    )
    {
        if ( this.wasmModule === null )
        {
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.wasmInitMissing ),
            );
        }
        else if ( this.nativeRecognizerRunner !== null )
        {
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.runnerExists ),
            );
        }
        else
        {
            this.setupMetadataCallbacks( msg.registeredMetadataCallbacks );
            try
            {
                if ( this.willSoonExpire() )
                {
                    const serverPermissionResult =
                        await this.obtainNewServerPermission( false );
                    if (
                        serverPermissionResult !==
                        License.ServerPermissionSubmitResultStatus.Ok
                    )
                    {
                        const resultStatus =
                            License.ServerPermissionSubmitResultStatus[
                                serverPermissionResult
                            ];
                        this.notifyError(
                            msg,
                            new SerializableSDKError(
                                {
                                    code: ErrorTypes.ErrorCodes
                                        .WORKER_LICENSE_UNLOCK_ERROR,
                                    message: `Cannot initialize recognizers because of invalid server permission:
                                    ${resultStatus}`,
                                },
                                {
                                    type: License.LicenseErrorType[
                                        resultStatus as keyof typeof License.LicenseErrorType
                                    ],
                                },
                            ),
                        );
                        return;
                    }
                }

                const recognizers = this.getRecognizers( msg.recognizerHandles );

                /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                                  @typescript-eslint/no-unsafe-member-access,
                                  @typescript-eslint/no-unsafe-call */
                this.nativeRecognizerRunner =
                    new this.wasmModule.RecognizerRunner(
                        recognizers,
                        msg.allowMultipleResults,
                        this.metadataCallbacks,
                    );
                /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                                 @typescript-eslint/no-unsafe-member-access,
                                 @typescript-eslint/no-unsafe-call */

                this.notifySuccess( msg );
            }
            catch ( error )
            {
                this.notifyError(
                    msg,
                    new SerializableSDKError(
                        ErrorTypes.workerErrors.runnerCreationFailure,
                        error,
                    ),
                );
            }
        }
    }

    private processReconfigureRecognizerRunner(
        msg: Messages.ReconfigureRecognizerRunner,
    )
    {
        if ( this.wasmModule === null )
        {
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.wasmInitMissing ),
            );
        }
        else if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.runnerMissing ),
            );
        }
        else
        {
            try
            {
                const recognizers = this.getRecognizers( msg.recognizerHandles );

                /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                                  @typescript-eslint/no-unsafe-member-access,
                                  @typescript-eslint/no-unsafe-call */
                this.nativeRecognizerRunner.reconfigureRecognizers(
                    recognizers,
                    msg.allowMultipleResults,
                );
                /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                                 @typescript-eslint/no-unsafe-member-access,
                                 @typescript-eslint/no-unsafe-call */

                this.notifySuccess( msg );
            }
            catch ( error )
            {
                this.notifyError(
                    msg,
                    new SerializableSDKError(
                        ErrorTypes.workerErrors.runnerReconfigureFailure,
                        error,
                    ),
                );
            }
        }
    }

    private processDeleteRecognizerRunner(
        msg: Messages.DeleteRecognizerRunner,
    )
    {
        if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.runnerDeleted ),
            );
            return;
        }

        try
        {
            /* eslint-disable @typescript-eslint/no-unsafe-call,
                              @typescript-eslint/no-unsafe-member-access */
            this.nativeRecognizerRunner.delete();
            this.nativeRecognizerRunner = null;
            this.notifySuccess( msg );
            /* eslint-enable @typescript-eslint/no-unsafe-call,
                             @typescript-eslint/no-unsafe-member-access */
        }
        catch ( error )
        {
            this.notifyError(
                msg,
                new SerializableSDKError(
                    ErrorTypes.workerErrors.runnerDeleteFailure,
                    error,
                ),
            );
        }
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    private wrapFunctions( values?: any, objectHandle?: number ): any
    {
        /* eslint-disable @typescript-eslint/no-explicit-any,
                          @typescript-eslint/no-unsafe-assignment,
                          @typescript-eslint/no-unsafe-argument,
                          @typescript-eslint/no-unsafe-member-access */
        if ( typeof values !== "object" )
        {
            return values;
        }

        const result: any = { ...values };

        const keys = Object.keys( result );
        for ( const key of keys )
        {
            const data: any = result[key];
            if ( typeof data === "function" )
            {
                const wrappedFunction: Messages.WrappedParameter = {
                    parameter: {
                        recognizerHandle: objectHandle,
                        callbackName: key,
                    } as Messages.CallbackAddress,
                    type: Messages.ParameterType.Callback,
                };
                result[key] = wrappedFunction;
            }
        }

        return result;
    }

    private processInvokeObject( msg: Messages.InvokeObjectMethod )
    {
        try
        {
            const objectHandle = msg.objectHandle;
            const methodName = msg.methodName;
            const params = this.unwrapParameters( msg );

            const object = this.objects[objectHandle]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            if ( object === undefined )
            {
                this.notifyError(
                    msg,
                    new SerializableSDKError( {
                        message:
                            "Cannot find object with handle: " +
                            objectHandle.toString(),
                        code: ErrorTypes.ErrorCodes.WORKER_HANDLE_UNDEFINED,
                    } ),
                );
            }
            else
            {
                /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                                  @typescript-eslint/no-unsafe-member-access,
                                  @typescript-eslint/no-unsafe-call */
                const result = this.wrapFunctions(
                    object[methodName]( ...params ),
                    objectHandle,
                );
                /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                                @typescript-eslint/no-unsafe-member-access,
                                @typescript-eslint/no-unsafe-call */
                const transferrables = this.scanForTransferrables( result );
                if ( methodName === "delete" )
                {
                    delete this.objects[objectHandle];
                }

                this.context.postMessage(
                    new Messages.InvokeResultMessage( msg.messageID, result ),
                    transferrables,
                );
            }
        }
        catch ( error )
        {
            this.notifyError(
                msg,
                new SerializableSDKError(
                    ErrorTypes.workerErrors.objectInvokeFailure,
                    error,
                ),
            );
        }
    }

    private processImage( msg: Messages.ProcessImage )
    {
        if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.imageProcessFailure ),
            );
            return;
        }

        try
        {
            /* eslint-disable @typescript-eslint/no-unsafe-call,
                              @typescript-eslint/no-unsafe-member-access,
                              @typescript-eslint/no-unsafe-assignment */
            const result: number =
                this.nativeRecognizerRunner.processImage( msg.frame );
            /* eslint-enable @typescript-eslint/no-unsafe-call,
                             @typescript-eslint/no-unsafe-member-access,
                             @typescript-eslint/no-unsafe-assignment */

            // deref the image to an empty MessagePort to force GC
            // CAUSES MEMORY LEAKS IN SAFARI!
            if ( !isSafari() )
            {
                port1.postMessage( msg.frame.imageData.data, [msg.frame.imageData.data.buffer] );
            }

            this.context.postMessage(
                new Messages.ImageProcessResultMessage( msg.messageID, result ),
            );

        }
        catch ( error )
        {
            this.notifyError(
                msg,
                new SerializableSDKError(
                    ErrorTypes.workerErrors.imageProcessFailure,
                    error,
                ),
            );
        }
    }

    private resetRecognizers( msg: Messages.ResetRecognizers )
    {
        if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.imageProcessFailure ),
            );
            return;
        }

        try
        {
            /* eslint-disable @typescript-eslint/no-unsafe-call,
                              @typescript-eslint/no-unsafe-member-access */
            this.nativeRecognizerRunner.resetRecognizers( msg.hardReset );
            this.notifySuccess( msg );
            /* eslint-enable @typescript-eslint/no-unsafe-call,
                             @typescript-eslint/no-unsafe-member-access */
        }
        catch ( error )
        {
            this.notifyError(
                msg,
                new SerializableSDKError(
                    ErrorTypes.workerErrors.imageProcessFailure,
                    error,
                ),
            );
        }
    }

    private setPingProxyUrl( msg: Messages.SetPingProxyUrl )
    {
        if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.runnerMissing ),
            );
            return;
        }

        try
        {
            /* eslint-disable @typescript-eslint/no-unsafe-call,
                              @typescript-eslint/no-unsafe-member-access */
            this.nativeRecognizerRunner.setPingProxyUrl(
                msg.pingProxyUrl,
            );
            this.notifySuccess( msg );
        }
        catch ( error: any )
        {
            if ( "cause" in error && error.cause === "PERMISSION_NOT_GRANTED" )
            {
                this.notifyError(
                    msg,
                    new SerializableSDKError(
                        ErrorTypes.pingErrors.permissionNotGranted,
                        error,
                    ),
                );
            }
            else
            {
                this.notifyError(
                    msg,
                    new SerializableSDKError(
                        ErrorTypes.workerErrors.runnerMissing,
                        error,
                    ),
                );
            }
        }
    }

    private setPingData( msg: Messages.SetPingData )
    {
        if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.runnerMissing ),
            );
            return;
        }

        try
        {
            /* eslint-disable @typescript-eslint/no-unsafe-call,
                              @typescript-eslint/no-unsafe-member-access */
            this.nativeRecognizerRunner.setPingData(
                msg.data,
            );
            this.notifySuccess( msg );
        }
        catch ( error: any )
        {
            if ( "cause" in error )
            {
                console.log( "there is cause in error", error.cause );

                switch ( error.cause )
                {
                    case "PING_EXTRAS_TOO_MANY_KEYS":
                        this.notifyError(
                            msg,
                            new SerializableSDKError(
                                ErrorTypes.pingErrors.dataKeysAmountExceeded,
                                error,
                            ),
                        );
                        break;
                    case "PING_EXTRAS_KEY_TOO_LONG":
                        this.notifyError(
                            msg,
                            new SerializableSDKError(
                                ErrorTypes.pingErrors.dataKeyLengthExceeded,
                                error,
                            ),
                        );
                        break;
                    case "PING_EXTRAS_VALUE_TOO_LONG":
                        this.notifyError(
                            msg,
                            new SerializableSDKError(
                                ErrorTypes.pingErrors.dataValueLengthExceeded,
                                error,
                            ),
                        );
                        break;
                    default:
                        this.notifyError(
                            msg,
                            new SerializableSDKError(
                                ErrorTypes.workerErrors.runnerMissing,
                                error,
                            ),
                        );
                }
            }

            this.notifyError(
                msg,
                new SerializableSDKError(
                    ErrorTypes.workerErrors.runnerMissing,
                    error,
                ),
            );
        }
    }

    private setDetectionOnly( msg: Messages.SetDetectionOnly )
    {
        if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.imageProcessFailure ),
            );
            return;
        }

        try
        {
            /* eslint-disable @typescript-eslint/no-unsafe-call,
                              @typescript-eslint/no-unsafe-member-access */
            this.nativeRecognizerRunner.setDetectionOnlyMode(
                msg.detectionOnlyMode,
            );
            this.notifySuccess( msg );
            /* eslint-enable @typescript-eslint/no-unsafe-call,
                             @typescript-eslint/no-unsafe-member-access */
        }
        catch ( error )
        {
            this.notifyError(
                msg,
                new SerializableSDKError(
                    ErrorTypes.workerErrors.imageProcessFailure,
                    error,
                ),
            );
        }
    }

    private setCameraPreviewMirrored( msg: Messages.SetCameraPreviewMirrored )
    {
        if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.imageProcessFailure ),
            );
            return;
        }

        try
        {
            /* eslint-disable @typescript-eslint/no-unsafe-call,
                              @typescript-eslint/no-unsafe-member-access */
            this.nativeRecognizerRunner.setCameraPreviewMirrored(
                msg.cameraPreviewMirrored,
            );
            this.notifySuccess( msg );
            /* eslint-enable @typescript-eslint/no-unsafe-call,
                             @typescript-eslint/no-unsafe-member-access */
        }
        catch ( error )
        {
            this.notifyError(
                msg,
                new SerializableSDKError(
                    ErrorTypes.workerErrors.imageProcessFailure,
                    error,
                ),
            );
        }
    }

    private setupMetadataCallbacks(
        registeredMetadataCallbacks: Messages.RegisteredMetadataCallbacks,
    )
    {
        // setup local callbacks
        if ( registeredMetadataCallbacks.onDebugText )
        {
            this.metadataCallbacks.onDebugText = ( debugText: string ) =>
            {
                const msg = new Messages.InvokeCallbackMessage(
                    Messages.MetadataCallback.onDebugText,
                    [debugText],
                );
                this.context.postMessage( msg );
            };
        }
        else
        {
            delete this.metadataCallbacks.onDebugText;
        }

        if ( registeredMetadataCallbacks.onDetectionFailed )
        {
            this.metadataCallbacks.onDetectionFailed = () =>
            {
                const msg = new Messages.InvokeCallbackMessage(
                    Messages.MetadataCallback.onDetectionFailed,
                    [],
                );
                this.context.postMessage( msg );
            };
        }
        else
        {
            delete this.metadataCallbacks.onDetectionFailed;
        }

        if ( registeredMetadataCallbacks.onPointsDetection )
        {
            this.metadataCallbacks.onPointsDetection = (
                pointSet: DisplayablePoints,
            ) =>
            {
                const onPointsDetection =
                    Messages.MetadataCallback.onPointsDetection;
                const msg = new Messages.InvokeCallbackMessage(
                    onPointsDetection,
                    [pointSet],
                );
                this.context.postMessage( msg );
            };
        }
        else
        {
            delete this.metadataCallbacks.onPointsDetection;
        }

        if ( registeredMetadataCallbacks.onQuadDetection )
        {
            this.metadataCallbacks.onQuadDetection = (
                quad: DisplayableQuad,
            ) =>
            {
                const msg = new Messages.InvokeCallbackMessage(
                    Messages.MetadataCallback.onQuadDetection,
                    [quad],
                );
                this.context.postMessage( msg );
            };
        }
        else
        {
            delete this.metadataCallbacks.onQuadDetection;
        }

        if ( registeredMetadataCallbacks.onFirstSideResult )
        {
            this.metadataCallbacks.onFirstSideResult = () =>
            {
                const msg = new Messages.InvokeCallbackMessage(
                    Messages.MetadataCallback.onFirstSideResult,
                    [],
                );
                this.context.postMessage( msg );
            };
        }
        else
        {
            delete this.metadataCallbacks.onFirstSideResult;
        }
    }

    private registerMetadataCallbacks( msg: Messages.RegisterMetadataCallbacks )
    {
        if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.imageProcessFailure ),
            );
            return;
        }

        this.setupMetadataCallbacks( msg.registeredMetadataCallbacks );
        try
        {
            /* eslint-disable @typescript-eslint/no-unsafe-call,
                              @typescript-eslint/no-unsafe-member-access */
            this.nativeRecognizerRunner.setJSDelegate( this.metadataCallbacks );
            this.notifySuccess( msg );
            /* eslint-enable @typescript-eslint/no-unsafe-call,
                             @typescript-eslint/no-unsafe-member-access */
        }
        catch ( error )
        {
            this.notifyError(
                msg,
                new SerializableSDKError(
                    ErrorTypes.workerErrors.imageProcessFailure,
                    error,
                ),
            );
        }
    }


    private processGetProductIntegrationInfo(
        msg: Messages.GetProductIntegrationInfo,
    )
    {
        if ( this.wasmModule === null )
        {
            this.notifyError(
                msg,
                new SerializableSDKError( ErrorTypes.workerErrors.wasmInitMissing ),
            );
            return;
        }

        try
        {
            /* eslint-disable @typescript-eslint/no-unsafe-call,
                              @typescript-eslint/no-unsafe-member-access */
            const activeLicenseTokenInfo =
                this.wasmModule.getActiveLicenseTokenInfo() as License.LicenseUnlockResult;
            /* eslint-enable @typescript-eslint/no-unsafe-call,
                             @typescript-eslint/no-unsafe-member-access */

            const result = {
                userId: msg.userId,
                licenseId: activeLicenseTokenInfo.licenseId,
                licensee: activeLicenseTokenInfo.licensee,
                productName: activeLicenseTokenInfo.sdkName,
                productVersion: activeLicenseTokenInfo.sdkVersion,
                platform: "Browser",
                device: self.navigator.userAgent,
                packageName: activeLicenseTokenInfo.packageName,
            };

            this.context.postMessage(
                new Messages.ProductIntegrationResultMessage(
                    msg.messageID,
                    result,
                ),
            );
        }
        catch ( error )
        {
            this.notifyError(
                msg,
                new SerializableSDKError(
                    ErrorTypes.workerErrors.objectInvokeFailure,
                    error,
                ),
            );
        }
    }
}
