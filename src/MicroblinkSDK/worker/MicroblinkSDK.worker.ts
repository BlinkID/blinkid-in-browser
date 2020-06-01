import * as Messages from './Messages'
import { MetadataCallbacks, DisplayablePoints, DisplayableQuad } from '../MetadataCallbacks'
import { convertEmscriptenStatusToProgress } from '../LoadProgressUtils';
import { ClearTimeoutCallback } from "../ClearTimeoutCallback";

const context: Worker = self as any;
let wasmModule: any = null;

let nativeRecognizerRunner: any = null;

let objects: { [ key: number ] : any } = {};
let nextObjectHandle = 0;

let metadataCallbacks: MetadataCallbacks = {};
let clearTimeoutCallback: ClearTimeoutCallback | null;

function getNextObjectHandle()
{
    const handle = nextObjectHandle;
    nextObjectHandle = nextObjectHandle + 1;
    return handle;
}

context.onmessage = ( event: MessageEvent ) =>
{
    const msg = ( event.data );
    switch( msg.action )
    {
        case Messages.InitMessage.action:
            processInitMessage( msg as Messages.InitMessage );
            break;
        case Messages.InvokeFunction.action:
            processInvokeFunction( msg as Messages.InvokeFunction );
            break;
        case Messages.CreateNewRecognizer.action:
            processCreateNewRecognizer( msg as Messages.CreateNewRecognizer );
            break;
        case Messages.InvokeObjectMethod.action:
            processInvokeObject( msg as Messages.InvokeObjectMethod );
            break;
        case Messages.CreateRecognizerRunner.action:
            processCreateRecognizerRunner( msg as Messages.CreateRecognizerRunner );
            break;
        case Messages.ReconfigureRecognizerRunner.action:
            processReconfigureRecognizerRunner( msg as Messages.ReconfigureRecognizerRunner );
            break;
        case Messages.DeleteRecognizerRunner.action:
            processDeleteRecognizerRunner( msg as Messages.DeleteRecognizerRunner );
            break;
        case Messages.ProcessImage.action:
            processImage( msg as Messages.ProcessImage );
            break;
        case Messages.ResetRecognizers.action:
            resetRecognizers( msg as Messages.ResetRecognizers );
            break;
        case Messages.SetDetectionOnly.action:
            setDetectionOnly( msg as Messages.SetDetectionOnly );
            break;
        case Messages.SetCameraPreviewMirrored.action:
            setCameraPreviewMirrored( msg as Messages.SetCameraPreviewMirrored );
            break;
        case Messages.RegisterMetadataCallbacks.action:
            registerMetadataCallbacks( msg as Messages.RegisterMetadataCallbacks );
            break;
        case Messages.SetClearTimeoutCallback.action:
            registerClearTimeoutCallback( msg as Messages.SetClearTimeoutCallback );
            break;
        default:
            console.error( "Unknown message action: " + msg.action );
            throw new Error( "Unknown message action: " + msg.action );
    }
};

function notifyError( originalMessage: Messages.RequestMessage, error: string )
{
    context.postMessage
    (
        new Messages.StatusMessage
        (
            originalMessage.messageID,
            false,
            error
        )
    );
}

function notifySuccess( originalMessage: Messages.RequestMessage )
{
    context.postMessage( new Messages.StatusMessage( originalMessage.messageID, true, null ) );
}

interface MessageWithParameters extends Messages.RequestMessage
{
    readonly params: Array< Messages.WrappedParameter >
}

function unwrapParameters( msgWithParams: MessageWithParameters ): Array< any >
{
    const params: Array< any > = []
    for ( let i in msgWithParams.params )
    {
        const wrappedParam = msgWithParams.params[ i ];
        let unwrappedParam = wrappedParam.parameter;
        if ( wrappedParam.type === Messages.ParameterType.Recognizer )
        {
            unwrappedParam = objects[ unwrappedParam ];
            if ( unwrappedParam === undefined )
            {
                notifyError( msgWithParams, "Cannot find object with handle: " + unwrappedParam );
            }
        }
        params.push( unwrappedParam );
    }
    return params;
}

function scanForTransferrables( object: any ): Array< Transferable >
{
    if ( typeof object === 'object' )
    {
        const keys = Object.keys( object );
        const transferrables: Array< Transferable > = []

        for ( let i in keys )
        {
            const key = keys[ i ];
            const data = object[ key ];
            if ( data instanceof ImageData )
            {
                transferrables.push( data.data.buffer );
            }
            else if ( data instanceof Uint8Array )
            {
                transferrables.push( data.buffer );
            }
            else if ( data != null && typeof data === 'object' ) // typeof( null ) === 'object', https://www.quora.com/Why-is-null-considered-an-object-in-JavaScript
            {
                transferrables.push( ... scanForTransferrables( data ) );
            }
        }
        return transferrables
    }
    else
    {
        return []
    }
}

// message process functions

function processInitMessage( msg: Messages.InitMessage )
{
    let module = undefined;

    if ( msg.registerLoadCallback )
    {
        module = {
            'setStatus': ( text: string ) =>
            {
                context.postMessage( new Messages.LoadProgressMessage( convertEmscriptenStatusToProgress( text ) ) );
            }
        };
    }

    try
    {
        const jsName = "./" + msg.wasmModuleName + ".js";
        importScripts( jsName );
        const loaderFunc = ( self as { [key: string]: any } )[ msg.wasmModuleName ];
        loaderFunc( module ).then
        (
            ( mbWasmModule: any ) =>
            {
                try
                {
                    mbWasmModule.initializeWithLicenseKey( msg.licenseKey, msg.userId, msg.allowHelloMessage );
                    wasmModule = mbWasmModule;
                    notifySuccess( msg );
                }
                catch ( licenseError )
                {
                    notifyError( msg, licenseError );
                }
            },
            ( error: any ) =>
            {
                console.log( "Failed to load WASM in web worker due to error: " + error );
                notifyError( msg, error );
            }
        );
    }
    catch( error )
    {
        console.log( "Failed to load WASM in web worker due to error: " + error );
        notifyError( msg, error );
    }
}

function processInvokeFunction( msg: Messages.InvokeFunction )
{
    if ( wasmModule == null )
    {
        notifyError( msg, "WASM module is not initialized!" );
    }
    else
    {
        const funcName = msg.funcName as string;
        const params = unwrapParameters( msg );

        try
        {
            const invocationResult = wasmModule[ funcName ]( ...params );
            context.postMessage
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
            notifyError( msg, error );
        }
    }
}

function processCreateNewRecognizer( msg: Messages.CreateNewRecognizer )
{
    if ( wasmModule == null )
    {
        notifyError( msg, "WASM module is not initialized!" );
    }
    else
    {
        const className = msg.className as string;
        const params = unwrapParameters( msg );

        try
        {
            const createdObject = new wasmModule[ className ]( ...params );
            const newHandle = getNextObjectHandle();
            objects[ newHandle ] = createdObject;

            context.postMessage
            (
                new Messages.ObjectCreatedMessage( msg.messageID, newHandle )
            );
        }
        catch ( error )
        {
            notifyError( msg, error );
        }
    }
}

function getRecognizers( recognizerHandles: Array< number > ): Array< any >
{
    const recognizers = [];
    for ( let i in recognizerHandles )
    {
        const handle = recognizerHandles[ i ];
        const recognizer = objects[ handle ];
        recognizers.push( recognizer );
    }
    return recognizers;
}

function processCreateRecognizerRunner( msg: Messages.CreateRecognizerRunner )
{
    if ( wasmModule == null )
    {
        notifyError( msg, "WASM module is not initialized!" );
    }
    else if ( nativeRecognizerRunner != null )
    {
        notifyError( msg, "Recognizer runner is already created! Multiple instances are not allowed!" );
    }
    else
    {
        setupMetadataCallbacks( msg.registeredMetadataCallbacks );
        try
        {
            const recognizers = getRecognizers( msg.recognizerHandles );

            nativeRecognizerRunner = new wasmModule.RecognizerRunner( recognizers, msg.allowMultipleResults, metadataCallbacks );

            notifySuccess( msg );
        }
        catch ( error )
        {
            notifyError( msg, error );
        }
    }
}

function processReconfigureRecognizerRunner( msg: Messages.ReconfigureRecognizerRunner )
{
    if ( wasmModule == null )
    {
        notifyError( msg, "WASM module is not initialized!" );
    }
    else if ( nativeRecognizerRunner == null )
    {
        notifyError( msg, "Recognizer runner is not created! There is nothing to reconfigure!" );
    }
    else
    {
        try
        {
            const recognizers = getRecognizers( msg.recognizerHandles );
            nativeRecognizerRunner.reconfigureRecognizers( recognizers, msg.allowMultipleResults );
            notifySuccess( msg );
        } catch( error )
        {
            notifyError( msg, error );
        }
    }
}

function processDeleteRecognizerRunner( msg: Messages.DeleteRecognizerRunner )
{
    if ( nativeRecognizerRunner == null )
    {
        notifyError( msg, "Recognizer runner is already deleted!" );
    }
    else
    {
        try
        {
            nativeRecognizerRunner.delete();
            nativeRecognizerRunner = null;
            notifySuccess( msg );
        }
        catch( error )
        {
            notifyError( msg, error );
        }
    }
}

function processInvokeObject( msg: Messages.InvokeObjectMethod )
{
    try
    {
        const objectHandle = msg.objectHandle as number;
        const methodName = msg.methodName as string;
        const params = unwrapParameters( msg );

        const object = objects[ objectHandle ];
        if ( object === undefined )
        {
            notifyError( msg, "Cannot find object with handle: " + objectHandle );
        }
        else
        {
            const result = object[ methodName ]( ...params );
            const transferrables = scanForTransferrables( result );
            if ( methodName == 'delete' )
            {
                delete objects[ objectHandle ];
            }

            context.postMessage
            (
                new Messages.InvokeResultMessage( msg.messageID, result ),
                transferrables
            );
        }
    }
    catch ( error )
    {
        notifyError( msg, error );
    }
}

function processImage( msg: Messages.ProcessImage )
{
    if ( nativeRecognizerRunner == null )
    {
        notifyError( msg, "Recognizer runner is not initialized! Cannot process image!" );
    }
    else
    {
        try
        {
            const image = msg.frame;
            const result: number = nativeRecognizerRunner.processImage( image );

            context.postMessage( new Messages.ImageProcessResultMessage( msg.messageID, result ) );
        }
        catch( error )
        {
            notifyError( msg, error );
        }
    }
}

function resetRecognizers( msg: Messages.ResetRecognizers )
{
    if ( nativeRecognizerRunner == null )
    {
        notifyError( msg, "Recognizer runner is not initialized! Cannot process image!" );
    }
    else
    {
        try
        {
            nativeRecognizerRunner.resetRecognizers( msg.hardReset );
            notifySuccess( msg );
        }
        catch ( error )
        {
            notifyError( msg, error );
        }
    }
}

function setDetectionOnly( msg: Messages.SetDetectionOnly )
{
    if ( nativeRecognizerRunner == null )
    {
        notifyError( msg, "Recognizer runner is not initialized! Cannot process image!" );
    }
    else
    {
        try
        {
            nativeRecognizerRunner.setDetectionOnlyMode( msg.detectionOnlyMode );
            notifySuccess( msg );
        }
        catch ( error )
        {
            notifyError( msg, error );
        }
    }
}

function setCameraPreviewMirrored( msg: Messages.SetCameraPreviewMirrored )
{
    if ( nativeRecognizerRunner == null )
    {
        notifyError( msg, "Recognizer runner is not initialized! Cannot process image!" );
    }
    else
    {
        try
        {
            nativeRecognizerRunner.setCameraPreviewMirrored( msg.cameraPreviewMirrored );
            notifySuccess( msg );
        }
        catch ( error )
        {
            notifyError( msg, error );
        }
    }
}

function setupMetadataCallbacks( registeredMetadataCallbacks: Messages.RegisteredMetadataCallbacks )
{
    // setup local callbacks
    if ( registeredMetadataCallbacks.onDebugText )
    {
        metadataCallbacks.onDebugText = ( debugText: string ) =>
        {
            const msg = new Messages.InvokeCallbackMessage( Messages.MetadataCallback.onDebugText, [ debugText ] );
            context.postMessage( msg );
        }
    }
    else
    {
        delete metadataCallbacks.onDebugText;
    }

    if ( registeredMetadataCallbacks.onDetectionFailed )
    {
        metadataCallbacks.onDetectionFailed = () =>
        {
            const msg = new Messages.InvokeCallbackMessage( Messages.MetadataCallback.onDetectionFailed, [] );
            context.postMessage( msg );
        }
    }
    else
    {
        delete metadataCallbacks.onDetectionFailed;
    }

    if ( registeredMetadataCallbacks.onPointsDetection )
    {
        metadataCallbacks.onPointsDetection = ( pointSet: DisplayablePoints ) =>
        {
            const msg = new Messages.InvokeCallbackMessage( Messages.MetadataCallback.onPointsDetection, [ pointSet ] );
            context.postMessage( msg );
        }
    }
    else
    {
        delete metadataCallbacks.onPointsDetection;
    }

    if ( registeredMetadataCallbacks.onQuadDetection )
    {
        metadataCallbacks.onQuadDetection = ( quad: DisplayableQuad ) =>
        {
            const msg = new Messages.InvokeCallbackMessage( Messages.MetadataCallback.onQuadDetection, [ quad ] );
            context.postMessage( msg );
        }
    }
    else
    {
        delete metadataCallbacks.onQuadDetection;
    }

    if ( registeredMetadataCallbacks.onFirstSideResult )
    {
        metadataCallbacks.onFirstSideResult = () =>
        {
            const msg = new Messages.InvokeCallbackMessage( Messages.MetadataCallback.onFirstSideResult, [] );
            context.postMessage( msg );
        }
    }
    else
    {
        delete metadataCallbacks.onFirstSideResult;
    }

    if ( registeredMetadataCallbacks.onGlare )
    {
        metadataCallbacks.onGlare = ( hasGlare: boolean ) =>
        {
            const msg = new Messages.InvokeCallbackMessage( Messages.MetadataCallback.onGlare, [ hasGlare ] );
            context.postMessage( msg );
        }
    }
    else
    {
        delete metadataCallbacks.onGlare;
    }
}

function registerMetadataCallbacks( msg: Messages.RegisterMetadataCallbacks )
{
    if ( nativeRecognizerRunner == null )
    {
        notifyError( msg, "Recognizer runner is not initialized! Cannot process image!" );
    }
    else
    {
        setupMetadataCallbacks( msg.registeredMetadataCallbacks );
        try
        {
            nativeRecognizerRunner.setJSDelegate( metadataCallbacks );
            notifySuccess( msg );
        }
        catch( error )
        {
            notifyError( msg, error );
        }
    }
}

function registerClearTimeoutCallback( msg: Messages.SetClearTimeoutCallback )
{
    if ( nativeRecognizerRunner == null )
    {
        notifyError( msg, "Recognizer runner is not initialized! Cannot process image!" );
    }
    else
    {
        if ( msg.callbackNonEmpty )
        {
            clearTimeoutCallback = {
                onClearTimeout: () =>
                {
                    const msg = new Messages.InvokeCallbackMessage( Messages.MetadataCallback.clearTimeoutCallback, [] );
                    context.postMessage( msg );
                }
            }
        }
        else
        {
            clearTimeoutCallback = null;
        }
        try
        {
            nativeRecognizerRunner.setClearTimeoutCallback( clearTimeoutCallback );
            notifySuccess( msg );
        }
        catch( error )
        {
            notifyError( msg, error );
        }
    }
}
