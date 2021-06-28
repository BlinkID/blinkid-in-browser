/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import * as Messages from "./Messages";
import * as Utils from "../Utils";
import * as WasmLoadUtils from "../WasmLoadUtils";

import
{
    MetadataCallbacks,
    DisplayablePoints,
    DisplayableQuad
} from "../MetadataCallbacks";

import { convertEmscriptenStatusToProgress } from "../LoadProgressUtils";
import { ClearTimeoutCallback } from "../ClearTimeoutCallback";
import * as License from "../License";
import { setupModule, supportsThreads, waitForThreadWorkers } from "../PThreadHelper";
import { WasmType } from "../WasmType";

interface MessageWithParameters extends Messages.RequestMessage
{
    readonly params: Array< Messages.WrappedParameter >
}

export default class MicroblinkWorker
{
    /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                      @typescript-eslint/no-explicit-any */
    private context: Worker = self as any;

    private wasmModule: any = null;

    private nativeRecognizerRunner: any = null;

    private objects: { [ key: number ] : any } = {};

    private nextObjectHandle = 0;

    private metadataCallbacks: MetadataCallbacks = {};

    private clearTimeoutCallback: ClearTimeoutCallback | null = null;

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
            switch( msg.action )
            {
                case Messages.InitMessage.action:
                    void this.processInitMessage( msg as Messages.InitMessage );
                    break;
                case Messages.InvokeFunction.action:
                    this.processInvokeFunction( msg as Messages.InvokeFunction );
                    break;
                case Messages.CreateNewRecognizer.action:
                    this.processCreateNewRecognizer( msg as Messages.CreateNewRecognizer );
                    break;
                case Messages.InvokeObjectMethod.action:
                    this.processInvokeObject( msg as Messages.InvokeObjectMethod );
                    break;
                case Messages.CreateRecognizerRunner.action:
                    void this.processCreateRecognizerRunner( msg as Messages.CreateRecognizerRunner );
                    break;
                case Messages.ReconfigureRecognizerRunner.action:
                    this.processReconfigureRecognizerRunner( msg as Messages.ReconfigureRecognizerRunner );
                    break;
                case Messages.DeleteRecognizerRunner.action:
                    this.processDeleteRecognizerRunner( msg as Messages.DeleteRecognizerRunner );
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
                    this.setCameraPreviewMirrored( msg as Messages.SetCameraPreviewMirrored );
                    break;
                case Messages.RegisterMetadataCallbacks.action:
                    this.registerMetadataCallbacks( msg as Messages.RegisterMetadataCallbacks );
                    break;
                case Messages.SetClearTimeoutCallback.action:
                    this.registerClearTimeoutCallback( msg as Messages.SetClearTimeoutCallback );
                    break;
                default:
                    throw new Error( "Unknown message action: " + JSON.stringify( msg.action ) );
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

    private notifyError( originalMessage: Messages.RequestMessage, error: License.LicenseErrorResponse | string )
    {
        this.context.postMessage
        (
            new Messages.StatusMessage
            (
                originalMessage.messageID,
                false,
                error
            )
        );
    }

    private notifySuccess( originalMessage: Messages.RequestMessage )
    {
        this.context.postMessage( new Messages.StatusMessage( originalMessage.messageID, true, null ) );
    }

    private notifyInitSuccess( originalMessage: Messages.RequestMessage, showOverlay: boolean, wasmType: WasmType )
    {
        this.context.postMessage(
            new Messages.InitSuccessMessage( originalMessage.messageID, true, showOverlay, wasmType )
        );
    }

    /* eslint-disable @typescript-eslint/no-explicit-any,
                      @typescript-eslint/no-unsafe-assignment,
                      @typescript-eslint/no-unsafe-member-access,
                      @typescript-eslint/no-unsafe-return */
    private unwrapParameters( msgWithParams: MessageWithParameters ): Array< any >
    {
        const params: Array< any > = [];
        for ( const wrappedParam of msgWithParams.params )
        {
            let unwrappedParam = wrappedParam.parameter;
            if ( wrappedParam.type === Messages.ParameterType.Recognizer )
            {
                unwrappedParam = this.objects[ unwrappedParam ];
                if ( unwrappedParam === undefined )
                {
                    this.notifyError( msgWithParams, "Cannot find object with handle: undefined" );
                }
            }
            else if ( wrappedParam.type === Messages.ParameterType.RecognizerSettings )
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
            const data = settings[ key ];
            if
            (
                typeof data        === "object" &&
                       data        !== null     &&
                       "parameter" in  data     &&
                       "type"      in  data     &&
                       data.type   === Messages.ParameterType.Callback
            )
            {
                settings[ key ] = ( ...args: any[] ): void =>
                {
                    const msg = new Messages.InvokeCallbackMessage
                    (
                        Messages.MetadataCallback.recognizerCallback,
                        [ data.parameter ].concat( args )
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
                     @typescript-eslint/no-unsafe-return */

    /* eslint-disable @typescript-eslint/no-explicit-any,
                      @typescript-eslint/no-unsafe-assignment,
                      @typescript-eslint/no-unsafe-member-access */
    private scanForTransferrables( object: any ): Array< Transferable >
    {
        if ( typeof object === "object" )
        {
            const keys = Object.keys( object );
            const transferrables: Array< Transferable > = [];

            for ( const key of keys )
            {
                const data = object[ key ];
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
        this.inFlightHeartBeatTimeoutId = setTimeout
        (
            () =>
            {
                void this.obtainNewServerPermission( true );
            },
            heartBeatDelay * 1000
        );

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
    private async obtainNewServerPermission
    (
        attemptOnNetworkError: boolean
    ): Promise< License.ServerPermissionSubmitResultStatus >
    {
        if ( this.wasmModule )
        {
            const activeTokenInfo = this.wasmModule.getActiveLicenseTokenInfo() as License.LicenseUnlockResult;
            const unlockResult = await License.obtainNewServerPermission( activeTokenInfo, this.wasmModule );
            switch( unlockResult.status )
            {
                case License.ServerPermissionSubmitResultStatus.Ok:
                case License.ServerPermissionSubmitResultStatus.RemoteLock:
                    // register new heart beat
                    this.registerHeartBeat( unlockResult.lease );
                    break;
                case License.ServerPermissionSubmitResultStatus.NetworkError:
                case License.ServerPermissionSubmitResultStatus.PayloadSignatureVerificationFailed:
                case License.ServerPermissionSubmitResultStatus.PayloadCorrupted:
                    if ( attemptOnNetworkError )
                    {
                        console.warn
                        (
                            "Problem with obtaining server permission. Will attempt in 10 seconds " +
                            License.ServerPermissionSubmitResultStatus[ unlockResult.status ]
                        );
                        // try again in 10 seconds
                        this.inFlightHeartBeatTimeoutId = setTimeout
                        (
                            () =>
                            {
                                void this.obtainNewServerPermission( false );
                            },
                            10 * 1000
                        );
                    }
                    else
                    {
                        console.error
                        (
                            "Problem with obtaining server permission. " +
                            License.ServerPermissionSubmitResultStatus[ unlockResult.status ]
                        );
                    }
                    break;
                case License.ServerPermissionSubmitResultStatus.IncorrectTokenState: // should never happen
                case License.ServerPermissionSubmitResultStatus.PermissionExpired: // should never happen
                    console.error
                    (
                        "Internal error: " +
                        License.ServerPermissionSubmitResultStatus[ unlockResult.status ]
                    );
                    break;
            }
            return unlockResult.status;
        }
        else
        {
            console.error( "Internal inconsistency! Wasm module not initialized where it's expected to be!" );
            return License.ServerPermissionSubmitResultStatus.IncorrectTokenState;
        }
    }

    private willSoonExpire(): boolean
    {
        if ( this.lease )
        {
            const tokenInfo = this.wasmModule.getActiveLicenseTokenInfo() as License.LicenseUnlockResult;

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

    private async calculateWasmType( msg: Messages.InitMessage ): Promise< WasmType >
    {
        if ( msg.wasmType !== null )
        {
            return msg.wasmType;
        }

        return await WasmLoadUtils.detectWasmType( msg.engineLocation );
    }

    private calculateEngineLocationPrefix( msg: Messages.InitMessage, wasmType: WasmType ): string
    {
        const engineLocation = msg.engineLocation === "" ? self.location.origin : msg.engineLocation;
        const engineLocationPrefix = Utils.getSafePath( engineLocation, WasmLoadUtils.wasmFolder( wasmType ) );
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
        const wasmType       = await this.calculateWasmType( msg );
        const engineLocation =       this.calculateEngineLocationPrefix( msg, wasmType );

        // See https://emscripten.org/docs/api_reference/module.html
        let module =
        {
            locateFile: ( path: string ) =>
            {
                return Utils.getSafePath( engineLocation, path );
            }
        };

        if ( msg.registerLoadCallback )
        {
            module = Object.assign
            (
                module,
                {
                    setStatus: ( text: string ) =>
                    {
                        const msg = new Messages.LoadProgressMessage( convertEmscriptenStatusToProgress( text ) );
                        this.context.postMessage( msg );
                    }
                }
            );
        }

        try
        {
            const jsName = msg.wasmModuleName + ".js";
            const jsPath = Utils.getSafePath( engineLocation, jsName );

            if ( supportsThreads( wasmType ) )
            {
                module = setupModule( module, msg.numberOfWorkers, jsPath );
            }

            importScripts( jsPath );
            const loaderFunc = ( self as { [key: string]: any } )[ msg.wasmModuleName ];
            loaderFunc( module ).then
            (
                async ( mbWasmModule: any ) =>
                {
                    if ( supportsThreads( wasmType ) )
                    {
                        // threads have been launched, but browser still hasn't managed to process worker creation
                        // requests. Since license unlocking may require multiple threads to perform license key
                        // decryption, without ready workers, a deadlock will occur.
                        // wait for browser threads to become available
                        if ( msg.allowHelloMessage )
                        {
                            console.log( "Waiting for thread workers to boot..." );
                        }
                        await waitForThreadWorkers( mbWasmModule );
                    }
                    const licenseResult = await License.unlockWasmSDK
                    (
                        msg.licenseKey,
                        msg.allowHelloMessage,
                        msg.userId,
                        mbWasmModule
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
                        this.notifyInitSuccess( msg, !!licenseResult.showOverlay, wasmType );
                    }
                    else
                    {
                        this.notifyError( msg, licenseResult.error );
                    }
                },
                ( error: any ) =>
                {
                    // Failed to load WASM in web worker due to error
                    this.notifyError( msg, error );
                }
            );
        }
        catch( error )
        {
            // Failed to load WASM in web worker due to error
            this.notifyError( msg, error );
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
            this.notifyError( msg, "WASM module is not initialized!" );
            return;
        }

        const funcName = msg.funcName;
        const params = this.unwrapParameters( msg );

        try
        {
            const invocationResult = this.wasmModule[ funcName ]( ...params );
            this.context.postMessage
            (
                new Messages.InvokeResultMessage
                (
                    msg.messageID,
                    invocationResult
                )
            );
        }
        catch ( error )
        {
            this.notifyError( msg, error );
        }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                     @typescript-eslint/no-unsafe-call,
                     @typescript-eslint/no-unsafe-member-access */

    /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                      @typescript-eslint/no-unsafe-call,
                      @typescript-eslint/no-unsafe-member-access */
    private processCreateNewRecognizer( msg: Messages.CreateNewRecognizer )
    {
        if ( this.wasmModule === null )
        {
            this.notifyError( msg, "WASM module is not initialized!" );
            return;
        }

        const className = msg.className;
        const params = this.unwrapParameters( msg );

        try
        {
            const createdObject = new this.wasmModule[ className ]( ...params );
            const newHandle = this.getNextObjectHandle();
            this.objects[ newHandle ] = createdObject;

            this.context.postMessage
            (
                new Messages.ObjectCreatedMessage( msg.messageID, newHandle )
            );
        }
        catch ( error )
        {
            this.notifyError( msg, error );
        }
    }
    /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                      @typescript-eslint/no-unsafe-call,
                      @typescript-eslint/no-unsafe-member-access */

    /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                      @typescript-eslint/no-explicit-any,
                      @typescript-eslint/no-unsafe-return */
    private getRecognizers( recognizerHandles: Array< number > ): Array< any >
    {
        const recognizers = [];
        for ( const handle of recognizerHandles )
        {
            const recognizer = this.objects[ handle ];
            recognizers.push( recognizer );
        }
        return recognizers;
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                     @typescript-eslint/no-explicit-any,
                     @typescript-eslint/no-unsafe-return */

    private async processCreateRecognizerRunner( msg: Messages.CreateRecognizerRunner )
    {
        if ( this.wasmModule === null )
        {
            this.notifyError( msg, "WASM module is not initialized!" );
        }
        else if ( this.nativeRecognizerRunner !== null )
        {
            this.notifyError( msg, "Recognizer runner is already created! Multiple instances are not allowed!" );
        }
        else
        {
            this.setupMetadataCallbacks( msg.registeredMetadataCallbacks );
            try
            {
                if ( this.willSoonExpire() )
                {
                    const serverPermissionResult = await this.obtainNewServerPermission( false );
                    if ( serverPermissionResult !== License.ServerPermissionSubmitResultStatus.Ok )
                    {
                        const resultStatus = License.ServerPermissionSubmitResultStatus[ serverPermissionResult ];
                        this.notifyError
                        (
                            msg,
                            new License.LicenseErrorResponse(
                                License.LicenseErrorType[ resultStatus as keyof typeof License.LicenseErrorType ],
                                `Cannot initialize recognizers because of invalid server permission: ${resultStatus}`
                            )
                        );
                        return;
                    }
                }

                const recognizers = this.getRecognizers( msg.recognizerHandles );

                /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                                  @typescript-eslint/no-unsafe-member-access,
                                  @typescript-eslint/no-unsafe-call */
                this.nativeRecognizerRunner = new this.wasmModule.RecognizerRunner
                (
                    recognizers,
                    msg.allowMultipleResults,
                    this.metadataCallbacks
                );
                /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                                 @typescript-eslint/no-unsafe-member-access,
                                 @typescript-eslint/no-unsafe-call */

                this.notifySuccess( msg );
            }
            catch ( error )
            {
                this.notifyError( msg, error );
            }
        }
    }

    private processReconfigureRecognizerRunner( msg: Messages.ReconfigureRecognizerRunner )
    {
        if ( this.wasmModule === null )
        {
            this.notifyError( msg, "WASM module is not initialized!" );
        }
        else if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError( msg, "Recognizer runner is not created! There is nothing to reconfigure!" );
        }
        else
        {
            try
            {
                const recognizers = this.getRecognizers( msg.recognizerHandles );

                /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                                  @typescript-eslint/no-unsafe-member-access,
                                  @typescript-eslint/no-unsafe-call */
                this.nativeRecognizerRunner.reconfigureRecognizers
                (
                    recognizers,
                    msg.allowMultipleResults
                );
                /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                                 @typescript-eslint/no-unsafe-member-access,
                                 @typescript-eslint/no-unsafe-call */

                this.notifySuccess( msg );
            }
            catch( error )
            {
                this.notifyError( msg, error );
            }
        }
    }

    private processDeleteRecognizerRunner( msg: Messages.DeleteRecognizerRunner )
    {
        if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError( msg, "Recognizer runner is already deleted!" );
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
        catch( error )
        {
            this.notifyError( msg, error );
        }
    }

    private processInvokeObject( msg: Messages.InvokeObjectMethod )
    {
        try
        {
            const objectHandle = msg.objectHandle;
            const methodName = msg.methodName;
            const params = this.unwrapParameters( msg );

            const object = this.objects[ objectHandle ]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            if ( object === undefined )
            {
                this.notifyError( msg, "Cannot find object with handle: " + objectHandle.toString() );
            }
            else
            {
                /* eslint-disable @typescript-eslint/no-unsafe-assignment,
                                  @typescript-eslint/no-unsafe-member-access,
                                  @typescript-eslint/no-unsafe-call */
                const result = object[ methodName ]( ...params );
                /* eslint-enable @typescript-eslint/no-unsafe-assignment,
                                @typescript-eslint/no-unsafe-member-access,
                                @typescript-eslint/no-unsafe-call */
                const transferrables = this.scanForTransferrables( result );
                if ( methodName === "delete" )
                {
                    delete this.objects[ objectHandle ];
                }

                this.context.postMessage
                (
                    new Messages.InvokeResultMessage( msg.messageID, result ),
                    transferrables
                );
            }
        }
        catch ( error )
        {
            this.notifyError( msg, error );
        }
    }

    private processImage( msg: Messages.ProcessImage )
    {
        if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError( msg, "Recognizer runner is not initialized! Cannot process image!" );
            return;
        }

        try
        {
            const image = msg.frame;
            /* eslint-disable @typescript-eslint/no-unsafe-call,
                              @typescript-eslint/no-unsafe-member-access,
                              @typescript-eslint/no-unsafe-assignment */
            const result: number = this.nativeRecognizerRunner.processImage( image );
            /* eslint-enable @typescript-eslint/no-unsafe-call,
                             @typescript-eslint/no-unsafe-member-access,
                             @typescript-eslint/no-unsafe-assignment */

            this.context.postMessage( new Messages.ImageProcessResultMessage( msg.messageID, result ) );
        }
        catch( error )
        {
            this.notifyError( msg, error );
        }
    }

    private resetRecognizers( msg: Messages.ResetRecognizers )
    {
        if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError( msg, "Recognizer runner is not initialized! Cannot process image!" );
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
            this.notifyError( msg, error );
        }
    }

    private setDetectionOnly( msg: Messages.SetDetectionOnly )
    {
        if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError( msg, "Recognizer runner is not initialized! Cannot process image!" );
            return;
        }

        try
        {
            /* eslint-disable @typescript-eslint/no-unsafe-call,
                              @typescript-eslint/no-unsafe-member-access */
            this.nativeRecognizerRunner.setDetectionOnlyMode( msg.detectionOnlyMode );
            this.notifySuccess( msg );
            /* eslint-enable @typescript-eslint/no-unsafe-call,
                             @typescript-eslint/no-unsafe-member-access */
        }
        catch ( error )
        {
            this.notifyError( msg, error );
        }
    }

    private setCameraPreviewMirrored( msg: Messages.SetCameraPreviewMirrored )
    {
        if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError( msg, "Recognizer runner is not initialized! Cannot process image!" );
            return;
        }

        try
        {
            /* eslint-disable @typescript-eslint/no-unsafe-call,
                              @typescript-eslint/no-unsafe-member-access */
            this.nativeRecognizerRunner.setCameraPreviewMirrored( msg.cameraPreviewMirrored );
            this.notifySuccess( msg );
            /* eslint-enable @typescript-eslint/no-unsafe-call,
                             @typescript-eslint/no-unsafe-member-access */
        }
        catch ( error )
        {
            this.notifyError( msg, error );
        }
    }

    private setupMetadataCallbacks( registeredMetadataCallbacks: Messages.RegisteredMetadataCallbacks )
    {
        // setup local callbacks
        if ( registeredMetadataCallbacks.onDebugText )
        {
            this.metadataCallbacks.onDebugText = ( debugText: string ) =>
            {
                const msg = new Messages.InvokeCallbackMessage( Messages.MetadataCallback.onDebugText, [ debugText ] );
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
                const msg = new Messages.InvokeCallbackMessage( Messages.MetadataCallback.onDetectionFailed, [] );
                this.context.postMessage( msg );
            };
        }
        else
        {
            delete this.metadataCallbacks.onDetectionFailed;
        }

        if ( registeredMetadataCallbacks.onPointsDetection )
        {
            this.metadataCallbacks.onPointsDetection = ( pointSet: DisplayablePoints ) =>
            {
                const onPointsDetection = Messages.MetadataCallback.onPointsDetection;
                const msg = new Messages.InvokeCallbackMessage( onPointsDetection, [ pointSet ] );
                this.context.postMessage( msg );
            };
        }
        else
        {
            delete this.metadataCallbacks.onPointsDetection;
        }

        if ( registeredMetadataCallbacks.onQuadDetection )
        {
            this.metadataCallbacks.onQuadDetection = ( quad: DisplayableQuad ) =>
            {
                const msg = new Messages.InvokeCallbackMessage( Messages.MetadataCallback.onQuadDetection, [ quad ] );
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
                const msg = new Messages.InvokeCallbackMessage( Messages.MetadataCallback.onFirstSideResult, [] );
                this.context.postMessage( msg );
            };
        }
        else
        {
            delete this.metadataCallbacks.onFirstSideResult;
        }

        if ( registeredMetadataCallbacks.onGlare )
        {
            this.metadataCallbacks.onGlare = ( hasGlare: boolean ) =>
            {
                const msg = new Messages.InvokeCallbackMessage( Messages.MetadataCallback.onGlare, [ hasGlare ] );
                this.context.postMessage( msg );
            };
        }
        else
        {
            delete this.metadataCallbacks.onGlare;
        }
    }

    private registerMetadataCallbacks( msg: Messages.RegisterMetadataCallbacks )
    {
        if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError( msg, "Recognizer runner is not initialized! Cannot process image!" );
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
        catch( error )
        {
            this.notifyError( msg, error );
        }
    }

    private registerClearTimeoutCallback( msg: Messages.SetClearTimeoutCallback )
    {
        if ( this.nativeRecognizerRunner === null )
        {
            this.notifyError( msg, "Recognizer runner is not initialized! Cannot process image!" );
            return;
        }

        if ( msg.callbackNonEmpty )
        {
            this.clearTimeoutCallback = {
                onClearTimeout: () =>
                {
                    const clearTimeoutCallback = Messages.MetadataCallback.clearTimeoutCallback;
                    const msg = new Messages.InvokeCallbackMessage( clearTimeoutCallback, [] );
                    this.context.postMessage( msg );
                }
            };
        }
        else
        {
            this.clearTimeoutCallback = null;
        }

        try
        {
            /* eslint-disable @typescript-eslint/no-unsafe-call,
                              @typescript-eslint/no-unsafe-member-access */
            this.nativeRecognizerRunner.setClearTimeoutCallback( this.clearTimeoutCallback );
            this.notifySuccess( msg );
            /* eslint-enable @typescript-eslint/no-unsafe-call,
                             @typescript-eslint/no-unsafe-member-access */
        }
        catch( error )
        {
            this.notifyError( msg, error );
        }
    }
}
