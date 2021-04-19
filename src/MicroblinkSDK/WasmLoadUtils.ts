/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import * as WasmFeatureDetect from "wasm-feature-detect";
import { WasmType } from "./WasmType";

export async function detectWasmType(): Promise< WasmType >
{
    // determine if all features required for advanced WASM are available
    // currently, advanced wasm requires bulk memory, non-trapping floating point
    // and sign extension (this may change in the future).

    const haveBulkMemory = await WasmFeatureDetect.bulkMemory();
    const haveNonTrappingFloatingPoint = await WasmFeatureDetect.saturatedFloatToInt();
    const haveSignExtension = await WasmFeatureDetect.signExtensions();
    const haveThreads = await WasmFeatureDetect.threads();

    if ( haveBulkMemory && haveNonTrappingFloatingPoint && haveSignExtension )
    {
        if ( haveThreads )
        {
            return WasmType.AdvancedWithThreads;
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
