/* eslint-disable @typescript-eslint/no-unsafe-argument */

/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */


// THIS FILE RUNS ON THE MAIN THREAD

import * as Messages from "./Messages";
import { CapturedFrame } from "../FrameCapture";

import
{
    RecognizerResultState,
    RecognizerRunner,
    WasmModuleProxy,
    WasmSDK,
    Recognizer,
    RecognizerSettings,
    RecognizerResult,
    SignedPayload,
    ProductIntegrationInfo
} from "../DataStructures.js";

import { MetadataCallbacks, DisplayablePoints, DisplayableQuad } from "../MetadataCallbacks";
import { WasmSDKLoadSettings, OptionalLoadProgressCallback } from "../WasmLoadSettings";
import { WasmType } from "../WasmType";
import { nativeJsonizationEnabled } from "../../defaultWasmModule";
import { SDKError, SerializableSDKError } from "../SDKError";
import { isValidURL } from "../Utils";
import * as ErrorTypes from "../ErrorTypes";


// ============================================ /
// Web Worker Proxy Implementation              /
// ============================================ /

interface EventHandler
{
    ( msg: Messages.ResponseMessage ): void;
}

function defaultEventHandler(
    resolve: () => void,
    reject: ( reason: SDKError | string | null ) => void
): EventHandler
{
    return ( msg: Messages.ResponseMessage ) =>
    {
        const resultMsg = msg as Messages.StatusMessage;
        if ( resultMsg.success )
        {
            resolve();
        }
        else
        {
            if ( typeof resultMsg.error === "string" || resultMsg.error === null )
            {
                reject( resultMsg.error );
            }
            else
            {
                reject( new SDKError( resultMsg.error ) );
            }
        }
    };
}

function defaultResultEventHandler(
    successResolver: EventHandler,
    reject: ( reason: SerializableSDKError | string | null ) => void
): EventHandler
{
    return ( msg: Messages.ResponseMessage ) =>
    {
        const resultMsg = msg as Messages.StatusMessage;
        if ( resultMsg.success )
        {
            successResolver( msg );
        }
        else
        {
            if ( typeof resultMsg.error === "string" || resultMsg.error === null )
            {
                reject( resultMsg.error );
            }
            else
            {
                reject( new SDKError( resultMsg.error ) );
            }
        }
    };
}

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
function wrapParameters( params: Array< any > ): Array< Messages.WrappedParameter >
{
    // convert params
    const wrappedPrameters = [] as Array< Messages.WrappedParameter >;
    for ( let param of params )
    {
        let paramType = Messages.ParameterType.Any;
        if ( param instanceof RemoteRecognizer )
        {
            paramType = Messages.ParameterType.Recognizer;
            param = param.getRemoteObjectHandle();
        }
        wrappedPrameters.push
        (
            {
                parameter: param,
                type: paramType
            }
        );
    }
    return wrappedPrameters;
}
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */

export class RemoteRecognizer implements Recognizer
{
    /* eslint-disable lines-between-class-members, @typescript-eslint/ban-types */
    private readonly wasmSDKWorker : WasmSDKWorker;
    private          objectHandle  : number;
    readonly         recognizerName: string;
    private          callbacks     : Map< string, Function >;
    /* eslint-enable lines-between-class-members */

    constructor( wasmWorker: WasmSDKWorker, recognizerName: string, remoteObjHandle: number )
    {
        this.wasmSDKWorker = wasmWorker;
        this.objectHandle = remoteObjHandle;
        this.recognizerName = recognizerName;
        this.callbacks = new Map< string, Function >();
    }
    /* eslint-enable @typescript-eslint/ban-types */

    getRemoteObjectHandle(): number
    {
        return this.objectHandle;
    }

    currentSettings(): Promise< RecognizerSettings >
    {
        return new Promise< RecognizerSettings >
        (
            ( resolve, reject ) =>
            {
                if ( this.objectHandle < 0 )
                {
                    reject( "Invalid object handle: " + this.objectHandle.toString() );
                    return;
                }

                const msg = new Messages.InvokeObjectMethod
                (
                    this.objectHandle,
                    "currentSettings",
                    []
                );
                const handler = defaultResultEventHandler
                (
                    ( msg: Messages.ResponseMessage ) =>
                    {
                        resolve( ( msg as Messages.InvokeResultMessage ).result );
                    },
                    reject
                );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        );
    }

    toSignedJSON(): Promise< SignedPayload | null >
    {
        if ( nativeJsonizationEnabled )
        {
            return new Promise< SignedPayload | null >
            (
                ( resolve, reject ) =>
                {
                    if ( this.objectHandle < 0 )
                    {
                        reject( "Invalid object handle: " + this.objectHandle.toString() );
                        return;
                    }

                    const msg = new Messages.InvokeObjectMethod
                    (
                        this.objectHandle,
                        "toSignedJSON",
                        []
                    );
                    const handler = defaultResultEventHandler
                    (
                        ( msg: Messages.ResponseMessage ) =>
                        {
                            resolve( ( msg as Messages.InvokeResultMessage ).result );
                        },
                        reject
                    );
                    this.wasmSDKWorker.postMessage( msg, handler );
                }
            );
        }
        else
        {
            // native module does not support toSignedJSON method
            return Promise.resolve( null );
        }
    }

    private clearAllCallbacks()
    {
        this.callbacks.clear();
        this.wasmSDKWorker.unregisterRecognizerCallbacks( this.objectHandle );
    }

    /* eslint-disable @typescript-eslint/no-explicit-any,
                      @typescript-eslint/no-unsafe-assignment,
                      @typescript-eslint/no-unsafe-member-access,
                      @typescript-eslint/no-unsafe-return
    */
    // convert each function member into wrapped parameter, containing address where callback needs to be delivered
    private removeFunctions( settings: any ): any
    {
        // clear any existing callbacks
        this.clearAllCallbacks();

        const keys = Object.keys( settings );
        let needsRegistering = false;
        for ( const key of keys )
        {
            const data = settings[ key ];
            if ( typeof data === "function" )
            {
                this.callbacks.set( key, data );
                const wrappedFunction: Messages.WrappedParameter = {
                    parameter: {
                        recognizerHandle: this.objectHandle,
                        callbackName: key
                    } as Messages.CallbackAddress, // in order to know to which instance callback needs to be delivered
                    type: Messages.ParameterType.Callback
                };
                settings[ key ] = wrappedFunction;
                needsRegistering = true;
            }
        }
        if ( needsRegistering )
        {
            this.wasmSDKWorker.registerRecognizerCallbacks( this.objectHandle, this );
        }
        return settings;
    }
    /* eslint-enable @typescript-eslint/no-explicit-any,
                     @typescript-eslint/no-unsafe-assignment,
                     @typescript-eslint/no-unsafe-member-access,
                     @typescript-eslint/no-unsafe-return
    */

    updateSettings( newSettings: RecognizerSettings ): Promise< void >
    {
        return new Promise< void >
        (
            ( resolve, reject ) =>
            {
                if ( this.objectHandle < 0 )
                {
                    reject( "Invalid object handle: " + this.objectHandle.toString() );
                    return;
                }

                /* eslint-disable @typescript-eslint/no-unsafe-assignment */
                const msg = new Messages.InvokeObjectMethod
                (
                    this.objectHandle,
                    "updateSettings",
                    [
                        {
                            parameter: this.removeFunctions( newSettings ),
                            type: Messages.ParameterType.RecognizerSettings
                        }
                    ]
                );
                /* eslint-enable @typescript-eslint/no-unsafe-assignment */
                const handler = defaultEventHandler( resolve, reject );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        );
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    invokeCallback( callbackName: string, args: any[] ): void
    {
        const callback = this.callbacks.get( callbackName );
        if ( callback !== undefined )
        {
            callback( ...args );
        }
        else
        {
            console.warn( "Cannot find callback", callbackName );
        }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    getResult(): Promise< RecognizerResult >
    {
        return new Promise< RecognizerResult >
        (
            ( resolve, reject ) =>
            {
                if ( this.objectHandle < 0 )
                {
                    reject( "Invalid object handle: " + this.objectHandle.toString() );
                    return;
                }

                const msg = new Messages.InvokeObjectMethod( this.objectHandle, "getResult", [] );
                const handler = defaultResultEventHandler
                (
                    ( msg: Messages.ResponseMessage ) =>
                    {
                        resolve( ( msg as Messages.InvokeResultMessage ).result );
                    },
                    reject
                );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        );
    }

    delete(): Promise< void >
    {
        return new Promise< void >
        (
            ( resolve, reject ) =>
            {
                if ( this.objectHandle < 0 )
                {
                    reject( "Invalid object handle: " + this.objectHandle.toString() );
                    return;
                }

                this.clearAllCallbacks();

                const msg = new Messages.InvokeObjectMethod( this.objectHandle, "delete", [] );
                const handler = defaultEventHandler
                (
                    () =>
                    {
                        this.objectHandle = -1;
                        resolve();
                    },
                    reject
                );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        );
    }
}

function createRegisteredCallbacks
(
    metadataCallbacks: MetadataCallbacks
): Messages.RegisteredMetadataCallbacks
{
    const msg = new Messages.RegisteredMetadataCallbacks();

    // https://stackoverflow.com/a/20093686/213057
    msg.onDebugText       = !!metadataCallbacks.onDebugText;
    msg.onDetectionFailed = !!metadataCallbacks.onDetectionFailed;
    msg.onPointsDetection = !!metadataCallbacks.onPointsDetection;
    msg.onQuadDetection   = !!metadataCallbacks.onQuadDetection;
    msg.onFirstSideResult = !!metadataCallbacks.onFirstSideResult;

    return msg;
}

class RemoteRecognizerRunner implements RecognizerRunner
{
    private readonly wasmSDKWorker: WasmSDKWorker;

    private deleted = false;

    recognizers: Array< Recognizer >;

    constructor( wasmWorker: WasmSDKWorker, recognizers: Array< Recognizer > )
    {
        this.wasmSDKWorker = wasmWorker;
        this.recognizers = recognizers;
    }

    processImage( image: CapturedFrame ): Promise< RecognizerResultState >
    {
        return new Promise< RecognizerResultState >
        (
            ( resolve, reject ) =>
            {
                if ( this.deleted )
                {
                    reject( "Recognizer runner is deleted. It cannot be used anymore!" );
                    return;
                }

                const msg = new Messages.ProcessImage( image );
                const handler = defaultResultEventHandler
                (
                    ( response: Messages.ResponseMessage ) =>
                    {
                        const state: RecognizerResultState = (
                            response as Messages.ImageProcessResultMessage
                        ).recognitionState;
                        resolve( state );
                    },
                    reject
                );
                this.wasmSDKWorker.postTransferrableMessage( msg, handler );
            }
        );
    }

    reconfigureRecognizers
    (
        recognizers: Array< Recognizer >,
        allowMultipleResults: boolean
    ): Promise< void >
    {
        return new Promise< void >
        (
            ( resolve, reject ) =>
            {
                if ( this.deleted )
                {
                    reject( "Recognizer runner is deleted. It cannot be used anymore!" );
                    return;
                }

                const recognizerHandles = getRecognizerHandles( recognizers as Array< RemoteRecognizer > );
                const msg = new Messages.ReconfigureRecognizerRunner( recognizerHandles, allowMultipleResults );
                const handler = defaultEventHandler( resolve, reject );
                this.wasmSDKWorker.postMessage( msg, handler );
                this.recognizers = recognizers;
            }
        );
    }

    setMetadataCallbacks( metadataCallbacks: MetadataCallbacks ): Promise< void >
    {
        return new Promise< void >
        (
            ( resolve, reject ) =>
            {
                const msg = new Messages.RegisterMetadataCallbacks( createRegisteredCallbacks( metadataCallbacks ) );
                const handler = defaultEventHandler( resolve, reject );
                this.wasmSDKWorker.postMessageAndRegisterCallbacks( msg, metadataCallbacks, handler );
            }
        );
    }

    resetRecognizers( hardReset: boolean ): Promise< void >
    {
        return new Promise< void >
        (
            ( resolve, reject ) =>
            {
                const msg = new Messages.ResetRecognizers( hardReset );
                const handler = defaultEventHandler( resolve, reject );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        );
    }

    setDetectionOnlyMode( detectionOnly: boolean ): Promise< void >
    {
        return new Promise< void >
        (
            ( resolve, reject ) =>
            {
                const msg = new Messages.SetDetectionOnly( detectionOnly );
                const handler = defaultEventHandler( resolve, reject );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        );
    }

    setPingProxyUrl( url: string ): Promise< void >
    {
        if ( !isValidURL( url ) )
        {
            throw new SDKError( ErrorTypes.pingErrors.invalidProxyUrl );
        }

        return new Promise< void >
        (
            ( resolve, reject ) =>
            {
                const msg = new Messages.SetPingProxyUrl( url );
                const handler = defaultEventHandler( resolve, reject );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        );
    }

    setPingData( data: Record<string, string> ): Promise< void >
    {
        return new Promise< void >
        (
            ( resolve, reject ) =>
            {
                const msg = new Messages.SetPingData( data );
                const handler = defaultEventHandler( resolve, reject );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        );
    }

    setCameraPreviewMirrored( mirrored: boolean ): Promise< void >
    {
        return new Promise< void >
        (
            ( resolve, reject ) =>
            {
                const msg = new Messages.SetCameraPreviewMirrored( mirrored );
                const handler = defaultEventHandler( resolve, reject );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        );
    }

    delete(): Promise< void >
    {
        if ( this.deleted )
        {
            return Promise.reject( "Recognizer runner is already deleted." );
        }
        return new Promise< void >
        (
            ( resolve, reject ) =>
            {
                const msg = new Messages.DeleteRecognizerRunner();
                const handler = defaultEventHandler
                (
                    () =>
                    {
                        this.deleted = true;
                        resolve();
                    },
                    reject
                );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        );
    }
}

function getRecognizerHandles( remoteRecognizers: Array< RemoteRecognizer > )
{
    const recognizerHandles: Array< number > = [];
    for ( const remoteRecognizer of remoteRecognizers )
    {
        recognizerHandles.push( remoteRecognizer.getRemoteObjectHandle() );
    }
    return recognizerHandles;
}

class WasmModuleWorkerProxy implements WasmModuleProxy
{
    private readonly wasmSDKWorker: WasmSDKWorker;

    constructor( wasmSDKWorker: WasmSDKWorker )
    {
        this.wasmSDKWorker = wasmSDKWorker;
    }

    createRecognizerRunner
    (
        recognizers          : Array< Recognizer >,
        allowMultipleResults = false,
        metadataCallbacks    : MetadataCallbacks = {}
    ): Promise< RecognizerRunner >
    {
        return new Promise< RecognizerRunner >
        (
            ( resolve, reject ) =>
            {
                const recognizerHandles = getRecognizerHandles( recognizers as Array< RemoteRecognizer > );
                const msg = new Messages.CreateRecognizerRunner
                (
                    recognizerHandles,
                    allowMultipleResults,
                    createRegisteredCallbacks( metadataCallbacks )
                );
                const handler = defaultEventHandler
                (
                    () =>
                    {
                        resolve( new RemoteRecognizerRunner( this.wasmSDKWorker, recognizers ) );
                    },
                    reject
                );
                this.wasmSDKWorker.postMessageAndRegisterCallbacks( msg, metadataCallbacks, handler );
            }
        );
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    newRecognizer( className: string, ...constructorArgs: any[] ): Promise< Recognizer >
    {
        return new Promise< Recognizer >
        (
            ( resolve, reject ) =>
            {
                const msg = new Messages.CreateNewRecognizer( className, wrapParameters( constructorArgs ) );
                const handler = defaultResultEventHandler
                (
                    ( msg: Messages.ResponseMessage ) =>
                    {
                        const remoteRecognizer = new RemoteRecognizer
                        (
                            this.wasmSDKWorker,
                            className,
                            ( msg as Messages.ObjectCreatedMessage ).objectHandle
                        );
                        resolve( remoteRecognizer );
                    },
                    reject
                );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        );
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
}

export class WasmSDKWorker implements WasmSDK
{
    /* eslint-disable lines-between-class-members */
    readonly mbWasmModule            : WasmModuleWorkerProxy;
    readonly mbWasmWorker            : Worker;
    private          eventHandlers           : { [ key: number ] : EventHandler } = {};
    private          metadataCallbacks       : MetadataCallbacks = {};
    private          loadCallback            : OptionalLoadProgressCallback;
    private          recognizersWithCallbacks: Map< number, RemoteRecognizer >;
    private          userId                  : string;
    public           showOverlay             : boolean;
    public           loadedWasmType          : WasmType = WasmType.Basic; // will be updated after WASM gets loaded
    /* eslint-enable lines-between-class-members */

    private constructor
    (
        worker: Worker,
        loadProgressCallback: OptionalLoadProgressCallback,
        userId: string,
        rejectHandler: ( message: string ) => void
    )
    {
        this.mbWasmWorker = worker;
        this.mbWasmWorker.onmessage = ( event: MessageEvent ) => { this.handleWorkerEvent( event ); };
        this.mbWasmWorker.onerror = () =>
        {
            rejectHandler( "Problem during initialization of worker file!" );
            return;
        };
        this.mbWasmModule = new WasmModuleWorkerProxy( this );
        this.loadCallback = loadProgressCallback;
        this.recognizersWithCallbacks = new Map< number, RemoteRecognizer >();
        this.userId = userId;
        this.showOverlay = false;
    }

    postMessage( message: Messages.RequestMessage, eventHandler: EventHandler ): void
    {
        this.eventHandlers[ message.messageID ] = eventHandler;
        this.mbWasmWorker.postMessage( message );
    }

    postTransferrableMessage
    (
        message      : Messages.RequestMessage & Messages.TransferrableMessage,
        eventHandler : EventHandler
    ): void
    {
        this.eventHandlers[ message.messageID ] = eventHandler;
        this.mbWasmWorker.postMessage( message, message.getTransferrables() );
    }

    postMessageAndRegisterCallbacks
    (
        message           : Messages.RequestMessage,
        metadataCallbacks : MetadataCallbacks,
        eventHandler      : EventHandler
    ): void
    {
        this.eventHandlers[ message.messageID ] = eventHandler;
        this.metadataCallbacks = metadataCallbacks;
        this.mbWasmWorker.postMessage( message );
    }

    registerRecognizerCallbacks( remoteRecognizerHandle: number, recognizer: RemoteRecognizer ): void
    {
        this.recognizersWithCallbacks.set( remoteRecognizerHandle, recognizer );
    }

    unregisterRecognizerCallbacks( remoteRecognizerHandle: number ): void
    {
        this.recognizersWithCallbacks.delete( remoteRecognizerHandle );
    }

    /**
     * Clean up the active instance of the SDK.
     *
     * It's not possible to use the SDK after this method is called.
     */
    delete(): void
    {
        this.mbWasmWorker.terminate();
    }

    getProductIntegrationInfo(): Promise< ProductIntegrationInfo >
    {
        return new Promise< ProductIntegrationInfo >
        (
            ( resolve, reject ) =>
            {
                const msg = new Messages.GetProductIntegrationInfo( this.userId );
                const handler = defaultResultEventHandler
                (
                    ( msg: Messages.ResponseMessage ) =>
                    {
                        resolve( ( msg as Messages.ProductIntegrationResultMessage ).result );
                    },
                    reject
                );
                this.postMessage( msg, handler );
            }
        );
    }

    private handleWorkerEvent( event: MessageEvent )
    {
        if ( "isCallbackMessage" in event.data )
        {
            const msg = event.data as Messages.InvokeCallbackMessage;
            switch ( msg.callbackType )
            {
                case Messages.MetadataCallback.onDebugText:
                    if ( typeof this.metadataCallbacks.onDebugText === "function" )
                    {
                        this.metadataCallbacks.onDebugText( msg.callbackParameters[ 0 ] as string );
                    }
                    break;
                case Messages.MetadataCallback.onDetectionFailed:
                    if ( typeof this.metadataCallbacks.onDetectionFailed === "function" )
                    {
                        this.metadataCallbacks.onDetectionFailed();
                    }
                    break;
                case Messages.MetadataCallback.onPointsDetection:
                    if ( typeof this.metadataCallbacks.onPointsDetection === "function" )
                    {
                        this.metadataCallbacks.onPointsDetection( msg.callbackParameters[ 0 ] as DisplayablePoints );
                    }
                    break;
                case Messages.MetadataCallback.onQuadDetection:
                    if ( typeof this.metadataCallbacks.onQuadDetection === "function" )
                    {
                        this.metadataCallbacks.onQuadDetection( msg.callbackParameters[ 0 ] as DisplayableQuad );
                    }
                    break;
                case Messages.MetadataCallback.onFirstSideResult:
                    if ( typeof this.metadataCallbacks.onFirstSideResult === "function" )
                    {
                        this.metadataCallbacks.onFirstSideResult();
                    }
                    break;
                case Messages.MetadataCallback.recognizerCallback:
                {
                    // first parameter is address, other parameters are callback parameters
                    const address = msg.callbackParameters.shift() as Messages.CallbackAddress;
                    const recognizer = this.recognizersWithCallbacks.get( address.recognizerHandle );
                    if ( recognizer !== undefined )
                    {
                        recognizer.invokeCallback( address.callbackName, msg.callbackParameters );
                    }
                    else
                    {
                        console.warn
                        (
                            "Cannot find recognizer to deliver callback message. Maybe it's destroyed?",
                            address
                        );
                    }
                    break;
                }
                default:
                    throw new Error( `Unknown callback type: ${ Messages.MetadataCallback[ msg.callbackType ] }` );
            }
        }
        else if ( "isLoadProgressMessage" in event.data )
        {
            const msg = event.data as Messages.LoadProgressMessage;

            if ( typeof this.loadCallback === "function" )
            {
                this.loadCallback( msg.progress );
            }
        }
        else
        {
            const msg = event.data as Messages.ResponseMessage;
            const eventHandler = this.eventHandlers[ msg.messageID ];
            delete this.eventHandlers[ msg.messageID ];
            eventHandler( msg );
        }
    }

    static async createWasmWorker
    (
        worker           : Worker,
        wasmLoadSettings : WasmSDKLoadSettings,
        userId           : string
    ): Promise< WasmSDKWorker >
    {
        return new Promise< WasmSDKWorker >
        (
            ( resolve, reject ) =>
            {
                const wasmWorker = new WasmSDKWorker
                (
                    worker,
                    wasmLoadSettings.loadProgressCallback,
                    userId,
                    reject
                );
                const initMessage = new Messages.InitMessage( wasmLoadSettings, userId );
                const initEventHandler = defaultResultEventHandler
                (
                    ( msg: Messages.ResponseMessage ) =>
                    {
                        const successMsg = msg as Messages.InitSuccessMessage;
                        wasmWorker.showOverlay = successMsg.showOverlay;
                        wasmWorker.loadedWasmType = successMsg.wasmType;
                        resolve( wasmWorker );
                    },
                    /* eslint-disable @typescript-eslint/no-explicit-any */
                    ( error: any ) =>
                    {
                        if ( wasmWorker && typeof wasmWorker.delete === "function" )
                        {
                            wasmWorker.delete();
                        }
                        reject( error );
                    }
                    /* eslint-enable @typescript-eslint/no-explicit-any */
                );
                wasmWorker.postMessage( initMessage, initEventHandler );
            }
        );
    }
}
