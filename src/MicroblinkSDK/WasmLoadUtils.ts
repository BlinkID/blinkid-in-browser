/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import * as WasmFeatureDetect from "wasm-feature-detect";
import { WasmType } from "./WasmType";

export async function detectWasmType( engineLocation: string ): Promise< WasmType >
{
    // determine if all features required for advanced WASM are available
    // currently, advanced wasm requires bulk memory, non-trapping floating point
    // and sign extension (this may change in the future).

    const haveBulkMemory = await WasmFeatureDetect.bulkMemory();
    const haveNonTrappingFloatingPoint = await WasmFeatureDetect.saturatedFloatToInt();
    const haveSignExtension = await WasmFeatureDetect.signExtensions();
    const haveSIMD = await WasmFeatureDetect.simd();
    const haveThreads = await WasmFeatureDetect.threads();

    if ( haveBulkMemory && haveNonTrappingFloatingPoint && haveSignExtension && haveSIMD )
    {
        if ( haveThreads )
        {
            /* The external worker files are loaded by the Emscripten’s thread
             * support code - each worker represents a thread. It’s not
             * currently possible to put all those workers inline.
             *
             * Also, due to browser security rules, it's not possible to load
             * external worker files from a different origin.
             *
             * Therefore, we need to ensure that remote workers are accessible.
             * For that reason, there is a dummy `WorkerTest.js` file. If that
             * file is loaded successfully and responds to a message, we can say
             * that `AdvancedWithThreads` bundle is available.
             */
            try
            {
                const worker = new Worker( `${ engineLocation }/WorkerTest.js` );

                return new Promise( ( resolve ) =>
                {
                    worker.postMessage( 1 );
                    worker.onmessage = () =>
                    {
                        resolve( WasmType.AdvancedWithThreads );
                        worker.terminate();
                    };

                    setTimeout( () =>
                    {
                        resolve( WasmType.Advanced );
                        worker.terminate();
                    }, 1000 );
                } );
            }
            catch
            {
                return WasmType.Advanced;
            }
        }
        else
        {
            return WasmType.Advanced;
        }
    }
    else
    {
        return WasmType.Basic;
    }
}

export function wasmFolder( wasmType: WasmType ): string
{
    switch( wasmType )
    {
        case WasmType.AdvancedWithThreads: return "advanced-threads";
        case WasmType.Advanced           : return "advanced";
        case WasmType.Basic              : return "basic";
    }
}
