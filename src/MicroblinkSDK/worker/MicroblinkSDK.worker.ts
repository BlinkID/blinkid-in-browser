import * as Messages from "./Messages";
import * as Utils from "../Utils";

import
{
    MetadataCallbacks,
    DisplayablePoints,
    DisplayableQuad
} from "../MetadataCallbacks";

import { convertEmscriptenStatusToProgress } from "../LoadProgressUtils";
import { ClearTimeoutCallback } from "../ClearTimeoutCallback";

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
                    this.processInitMessage( msg as Messages.InitMessage );
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
                    this.processCreateRecognizerRunner( msg as Messages.CreateRecognizerRunner );
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

    private notifyError( originalMessage: Messages.RequestMessage, error: string )
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
            params.push( unwrappedParam );
        }
        return params;
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

    // message process functions

    /* eslint-disable @typescript-eslint/no-explicit-any,
                      @typescript-eslint/no-unsafe-assignment,
                      @typescript-eslint/no-unsafe-call,
                      @typescript-eslint/no-unsafe-member-access */
    private processInitMessage( msg: Messages.InitMessage )
    {
        // See https://emscripten.org/docs/api_reference/module.html
        const module = {
            locateFile: ( path: string ) =>
            {
                return Utils.getSafePath( msg.engineLocation, path );
            }
        };

        if ( msg.registerLoadCallback )
        {
            Object.assign( module, {
                setStatus: ( text: string ) =>
                {
                    const msg = new Messages.LoadProgressMessage( convertEmscriptenStatusToProgress( text ) );
                    this.context.postMessage( msg );
                }
            } );
        }

        try
        {
            const jsName = msg.wasmModuleName + ".js";
            const jsPath = Utils.getSafePath( msg.engineLocation, jsName );
            importScripts( jsPath );
            const loaderFunc = ( self as { [key: string]: any } )[ msg.wasmModuleName ];
            loaderFunc( module ).then
            (
                ( mbWasmModule: any ) =>
                {
                    try
                    {
                        mbWasmModule.initializeWithLicenseKey( msg.licenseKey, msg.userId, msg.allowHelloMessage );
                        this.wasmModule = mbWasmModule;
                        this.notifySuccess( msg );
                    }
                    catch ( licenseError )
                    {
                        this.notifyError( msg, licenseError );
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

    private processCreateRecognizerRunner( msg: Messages.CreateRecognizerRunner )
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
