import * as Messages from "./Messages"
import { CapturedFrame } from "../FrameCapture";
import
{
    RecognizerResultState,
    RecognizerRunner,
    WasmModuleProxy,
    WasmSDK,
    Recognizer,
    RecognizerSettings,
    RecognizerResult} from "../DataStructures.js"
import { ClearTimeoutCallback } from "../ClearTimeoutCallback";
import { MetadataCallbacks, DisplayablePoints, DisplayableQuad } from "../MetadataCallbacks"
import { WasmSDKLoadSettings, OptionalLoadProgressCallback } from "../WasmLoadSettings";


////////////////////////////////////////////////
// Web Worker Proxy implementation
////////////////////////////////////////////////

interface EventHandler
{
    ( msg: Messages.ResponseMessage ): void;
}

function defaultEventHandler( resolve: any, reject: any )
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
            reject( resultMsg.error );
        }
    }
}

function defaultResultEventHandler( successResolver: EventHandler, reject: any )
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
            reject( resultMsg.error );
        }
    }
}

function wrapParameters( params: Array< any > ): Array< Messages.WrappedParameter >
{
    // convert params
    const wrappedPrameters = [];
    for ( let i in params )
    {
        let param = params[ i ];
        let paramType = Messages.ParameterType.Any;
        if ( param instanceof RemoteRecognizer )
        {
            paramType = Messages.ParameterType.Recognizer;
            param = param.getRemoteObjectHandle();
        }
        wrappedPrameters.push( { parameter: param, type: paramType } );
    }
    return wrappedPrameters;
}

export class RemoteRecognizer implements Recognizer
{
    private readonly wasmSDKWorker : WasmSDKWorker;
    private          objectHandle  : number;
            readonly recognizerName: string;

    constructor( wasmWorker: WasmSDKWorker, recognizerName: string, remoteObjHandle: number )
    {
        this.wasmSDKWorker = wasmWorker;
        this.objectHandle = remoteObjHandle;
        this.recognizerName = recognizerName;
    }

    getRemoteObjectHandle()
    {
        return this.objectHandle;
    }

    currentSettings(): Promise< RecognizerSettings >
    {
        if ( this.objectHandle < 0 )
        {
            return Promise.reject( "Invalid object handle: " + this.objectHandle );
        }
        return new Promise< RecognizerSettings >
        (
            ( resolve: any, reject: any ) =>
            {
                const msg = new Messages.InvokeObjectMethod( this.objectHandle, "currentSettings", [] );
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

    updateSettings( newSettings: RecognizerSettings ): Promise< void >
    {
        if ( this.objectHandle < 0 )
        {
            return Promise.reject( "Invalid object handle: " + this.objectHandle );
        }
        return new Promise< void >
        (
            ( resolve: any, reject: any ) =>
            {
                const msg = new Messages.InvokeObjectMethod( this.objectHandle, "updateSettings", [ { parameter: newSettings, type: Messages.ParameterType.Any } ] );
                const handler = defaultEventHandler( resolve, reject );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        );
    }

    getResult(): Promise< RecognizerResult >
    {
        if ( this.objectHandle < 0 )
        {
            return Promise.reject( "Invalid object handle: " + this.objectHandle );
        }
        return new Promise< RecognizerResult >
        (
            ( resolve: any, reject: any ) =>
            {
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
        if ( this.objectHandle < 0 )
        {
            return Promise.reject( "Invalid object handle: " + this.objectHandle );
        }
        return new Promise< void >
        (
            ( resolve: any, reject: any ) =>
            {
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

};

function createRegisteredCallbacks( metadataCallbacks: MetadataCallbacks )
{
    const msg = new Messages.RegisteredMetadataCallbacks();

    // https://stackoverflow.com/a/20093686/213057
    msg.onDebugText       = !!metadataCallbacks.onDebugText;
    msg.onDetectionFailed = !!metadataCallbacks.onDetectionFailed;
    msg.onPointsDetection = !!metadataCallbacks.onPointsDetection;
    msg.onQuadDetection   = !!metadataCallbacks.onQuadDetection;
    msg.onFirstSideResult = !!metadataCallbacks.onFirstSideResult;
    msg.onGlare           = !!metadataCallbacks.onGlare;
    return msg;
}

class RemoteRecognizerRunner implements RecognizerRunner
{
    private readonly wasmSDKWorker: WasmSDKWorker;
    private deleted = false;

    constructor( wasmWorker: WasmSDKWorker )
    {
        this.wasmSDKWorker = wasmWorker;
    }

    processImage( image: CapturedFrame ): Promise< RecognizerResultState >
    {
        if ( this.deleted )
        {
            return Promise.reject( "Recognizer runner is deleted. It cannot be used anymore!" );
        }
        return new Promise< RecognizerResultState >
        (
            ( resolve: any, reject: any ) =>
            {
                const msg = new Messages.ProcessImage( image );
                const handler = defaultResultEventHandler
                (
                    ( response: Messages.ResponseMessage ) =>
                    {
                        const state: RecognizerResultState = ( response as Messages.ImageProcessResultMessage ).recognitionState;
                        resolve( state );
                    },
                    reject
                );
                this.wasmSDKWorker.postTransferrableMessage( msg, handler );
            }
        );
    }

    reconfigureRecognizers( recognizers: Array< Recognizer >, allowMultipleResults: boolean ): Promise< void >
    {
        if ( this.deleted )
        {
            return Promise.reject( "Recognizer runner is deleted. It cannot be used anymore!" );
        }
        return new Promise< void >
        (
            ( resolve: any, reject: any ) =>
            {
                const recognizerHandles = getRecognizerHandles( recognizers as Array< RemoteRecognizer > );
                const msg = new Messages.ReconfigureRecognizerRunner( recognizerHandles, allowMultipleResults );
                const handler = defaultEventHandler( resolve, reject );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        );
    }

    setMetadataCallbacks( metadataCallbacks: MetadataCallbacks ): Promise< void >
    {
        return new Promise< void >
        (
            ( resolve: any, reject: any ) =>
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
            ( resolve: any, reject: any ) =>
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
            ( resolve: any, reject: any ) =>
            {
                const msg = new Messages.SetDetectionOnly( detectionOnly );
                const handler = defaultEventHandler( resolve, reject );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        );
    }

    setClearTimeoutCallback( clearTimeoutCallback: ClearTimeoutCallback | null ): Promise< void >
    {
        return new Promise< void >
        (
            ( resolve: any, reject: any ) =>
            {
                const msg = new Messages.SetClearTimeoutCallback( clearTimeoutCallback != null );
                const handler = defaultEventHandler( resolve, reject );
                this.wasmSDKWorker.registerClearTimeoutCallback( clearTimeoutCallback );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        )
    }

    setCameraPreviewMirrored( mirrored: boolean ): Promise< void >
    {
        return new Promise< void >
        (
            ( resolve: any, reject: any ) =>
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
            ( resolve: any, reject: any ) =>
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
};

function getRecognizerHandles( remoteRecognizers: Array< RemoteRecognizer > )
{
    const recognizerHandles: Array< number > = [];
    for ( let recognizerIndex in remoteRecognizers )
    {
        const remoteRecognizer = remoteRecognizers[ recognizerIndex ];
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

    createRecognizerRunner( recognizers: Array< Recognizer >, allowMultipleResults: boolean = false, metadataCallbacks: MetadataCallbacks = {} ): Promise< RecognizerRunner >
    {
        return new Promise< RecognizerRunner >
        (
            ( resolve: any, reject: any ) =>
            {
                const recognizerHandles = getRecognizerHandles( recognizers as Array< RemoteRecognizer > );
                const msg = new Messages.CreateRecognizerRunner( recognizerHandles, allowMultipleResults, createRegisteredCallbacks( metadataCallbacks ) );
                const handler = defaultEventHandler
                (
                    () =>
                    {
                        resolve( new RemoteRecognizerRunner( this.wasmSDKWorker ) );
                    },
                    reject
                );
                this.wasmSDKWorker.postMessageAndRegisterCallbacks( msg, metadataCallbacks, handler );
            }
        );
    }

    newRecognizer( className: string, ...constructorArgs: any[] ): Promise< Recognizer >
    {
        return new Promise< Recognizer >
        (
            ( resolve: any, reject: any ) =>
            {
                const msg = new Messages.CreateNewRecognizer( className, wrapParameters( constructorArgs ) );
                const handler = defaultResultEventHandler
                (
                    ( msg: Messages.ResponseMessage ) =>
                    {
                        resolve( new RemoteRecognizer( this.wasmSDKWorker, className, ( msg as Messages.ObjectCreatedMessage ).objectHandle ) );
                    },
                    reject
                );
                this.wasmSDKWorker.postMessage( msg, handler );
            }
        );
    }
}

export class WasmSDKWorker implements WasmSDK
{
    readonly mbWasmModule: WasmModuleWorkerProxy;

    private readonly mbWasmWorker: Worker;
    private eventHandlers: { [ key: number ] : EventHandler } = {};
    private metadataCallbacks: MetadataCallbacks = {};
    private loadCallback: OptionalLoadProgressCallback;
    private clearTimeoutCallback: ClearTimeoutCallback | null = null;

    private constructor( worker: Worker, loadProgressCallback: OptionalLoadProgressCallback )
    {
        this.mbWasmWorker = worker;
        this.mbWasmWorker.onmessage = ( event: MessageEvent ) => { this.handleWorkerEvent( event ); };
        this.mbWasmModule = new WasmModuleWorkerProxy( this );
        this.loadCallback = loadProgressCallback;
    }

    postMessage( message: Messages.RequestMessage, eventHandler: EventHandler )
    {
        this.eventHandlers[ message.messageID ] = eventHandler;
        this.mbWasmWorker.postMessage( message );
    }

    postTransferrableMessage( message: Messages.RequestMessage & Messages.TransferrableMessage, eventHandler: EventHandler )
    {
        this.eventHandlers[ message.messageID ] = eventHandler;
        this.mbWasmWorker.postMessage( message, message.getTransferrables() );
    }

    postMessageAndRegisterCallbacks( message: Messages.RequestMessage, metadataCallbacks: MetadataCallbacks, eventHandler: EventHandler )
    {
        this.eventHandlers[ message.messageID ] = eventHandler;
        this.metadataCallbacks = metadataCallbacks;
        this.mbWasmWorker.postMessage( message );
    }

    registerClearTimeoutCallback( callback: ClearTimeoutCallback | null )
    {
        this.clearTimeoutCallback = callback;
    }

    private handleWorkerEvent( event: MessageEvent )
    {
        if ( 'isCallbackMessage' in event.data )
        {
            const msg = event.data as Messages.InvokeCallbackMessage;
            switch ( msg.callbackType )
            {
                case Messages.MetadataCallback.onDebugText:
                    this.metadataCallbacks.onDebugText!( msg.callbackParameters[ 0 ] as string );
                    break;
                case Messages.MetadataCallback.onDetectionFailed:
                    this.metadataCallbacks.onDetectionFailed!();
                    break;
                case Messages.MetadataCallback.onPointsDetection:
                    this.metadataCallbacks.onPointsDetection!( msg.callbackParameters[ 0 ] as DisplayablePoints );
                    break;
                case Messages.MetadataCallback.onQuadDetection:
                    this.metadataCallbacks.onQuadDetection!( msg.callbackParameters[ 0 ] as DisplayableQuad );
                    break;
                case Messages.MetadataCallback.onFirstSideResult:
                    this.metadataCallbacks.onFirstSideResult!();
                    break;
                case Messages.MetadataCallback.clearTimeoutCallback:
                    this.clearTimeoutCallback!.onClearTimeout();
                    break;
                case Messages.MetadataCallback.onGlare:
                    this.metadataCallbacks.onGlare!( msg.callbackParameters[ 0 ] as boolean );
                    break;
                default:
                    throw new Error( "Unknown callback type " + msg.callbackType );
            }
        }
        else if ( 'isLoadProgressMessage' in event.data )
        {
            const msg = event.data as Messages.LoadProgressMessage;
            this.loadCallback!( msg.progress );
        }
        else
        {
            const msg = event.data as Messages.ResponseMessage;
            const eventHandler = this.eventHandlers[ msg.messageID ];
            delete this.eventHandlers[ msg.messageID ];
            eventHandler( msg );
        }
    }

    static async createWasmWorker( worker: Worker, wasmLoadSettings: WasmSDKLoadSettings, userId: string ): Promise< WasmSDKWorker >
    {
        return new Promise< WasmSDKWorker >
        (
            ( resolve: any, reject: any ) =>
            {
                const wasmWorker = new WasmSDKWorker( worker, wasmLoadSettings.loadProgressCallback );
                const initMessage = new Messages.InitMessage( wasmLoadSettings, userId );
                const initEventHandler = defaultEventHandler
                (
                    () =>
                    {
                        resolve( wasmWorker );
                    },
                    reject
                );
                wasmWorker.postMessage( initMessage, initEventHandler );
            }
        );
    }
}
