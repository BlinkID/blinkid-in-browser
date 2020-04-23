import { CapturedFrame } from "../FrameCapture"
import
{
    RecognizerResultState,
    RecognizerRunner,
    WasmModuleProxy,
    WasmSDK,
    Recognizer
} from "../DataStructures"
import { MetadataCallbacks } from "../MetadataCallbacks"
import { ClearTimeoutCallback } from '../ClearTimeoutCallback'

////////////////////////////////////////////////
// Local Proxy implementation
////////////////////////////////////////////////

class WasmLocalRecognizerRunner implements RecognizerRunner
{
    private nativeRecognizerRunner: any;

    constructor( nativeRecognizerRunner: any )
    {
        this.nativeRecognizerRunner = nativeRecognizerRunner;
    }

    processImage( image: CapturedFrame ): Promise< RecognizerResultState >
    {
        const result: number = this.nativeRecognizerRunner.processImage( image );
        return Promise.resolve( result );
    }

    reconfigureRecognizers( recognizers: Array< Recognizer >, allowMultipleResults: boolean ): Promise< void >
    {
        return new Promise
        (
            ( resolve: any, reject: any ) =>
            {
                try
                {
                    this.nativeRecognizerRunner.reconfigureRecognizers( recognizers, allowMultipleResults );
                    resolve();
                }
                catch( error )
                {
                    reject( error );
                }
            }
        );
    }

    setMetadataCallbacks( metadataCallbacks: MetadataCallbacks ): Promise< void >
    {
        this.nativeRecognizerRunner.setJSDelegate( metadataCallbacks );
        return Promise.resolve();
    }

    resetRecognizers( hardReset: boolean ): Promise< void >
    {
        this.nativeRecognizerRunner.resetRecognizers( hardReset );
        return Promise.resolve();
    }

    setDetectionOnlyMode( detectionOnly: boolean ): Promise< void >
    {
        this.nativeRecognizerRunner.setDetectionOnlyMode( detectionOnly );
        return Promise.resolve();
    }

    setClearTimeoutCallback( clearTimeoutCallback: ClearTimeoutCallback | null ): Promise< void >
    {
        this.nativeRecognizerRunner.setClearTimeoutCallback( clearTimeoutCallback );
        return Promise.resolve();
    }

    setCameraPreviewMirrored( mirrored: boolean ): Promise< void >
    {
        this.nativeRecognizerRunner.setCameraPreviewMirrored( mirrored );
        return Promise.resolve();
    }

    delete(): Promise< void >
    {
        this.nativeRecognizerRunner.delete();
        this.nativeRecognizerRunner = null;
        return Promise.resolve();
    }
};

class WasmModuleLocalProxy implements WasmModuleProxy
{
    private readonly realWasmModule: any;

    constructor( realWasmModule: any )
    {
        this.realWasmModule = realWasmModule;
    }

    newRecognizer( className: string, ...constructorArgs: any[] ): Promise< Recognizer >
    {
        const nativeRecognizer: Recognizer = new this.realWasmModule[ className ]( ...constructorArgs );
        ( nativeRecognizer as any ).recognizerName = className;
        return Promise.resolve( nativeRecognizer );
    }

    createRecognizerRunner( recognizers: Array< Recognizer >, allowMultipleResults: boolean = false, metadataCallbacks: MetadataCallbacks = {} ): Promise< RecognizerRunner >
    {
        const nativeRecognizerRunner = new this.realWasmModule.RecognizerRunner( recognizers, allowMultipleResults, metadataCallbacks );
        return Promise.resolve( new WasmLocalRecognizerRunner( nativeRecognizerRunner ) );
    }
};

export class WasmSDKLocal implements WasmSDK
{
    readonly mbWasmModule: WasmModuleProxy;

    constructor( wasmModule: any )
    {
        // this.mbWasmModule = new Proxy( new WasmModuleLocalProxy( wasmModule ), wasmModuleLocalProxyHandler );
        this.mbWasmModule = new WasmModuleLocalProxy( wasmModule );
    }
}
