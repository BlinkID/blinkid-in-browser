/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import * as WasmFeatureDetect from "wasm-feature-detect";
import { WasmType } from "./WasmType";

/* eslint-disable max-len */
/**
 * Safari 16 shipped with WASM threads support, but it didn't ship with nested
 * workers support, so an extra check is needed
 * https://github.com/GoogleChromeLabs/squoosh/pull/1325/files#diff-904900db64cd3f48b0e765dbbdc6a218a7ea74a199671bde82a8944a904db86f
 */
/* eslint-enable max-len */
export default async function checkThreadsSupport(): Promise<boolean>
{
    const supportsWasmThreads = await WasmFeatureDetect.threads();
    if ( !supportsWasmThreads ) return false;

    if ( !( "importScripts" in self ) )
    {
        throw Error( "Not implemented" );
    }

    return "Worker" in self;
}

export async function detectWasmType(): Promise<WasmType>
{
    // determine if all features required for advanced WASM are available
    // currently, advanced wasm requires SIMD

    const haveSIMD = await WasmFeatureDetect.simd();

    const threadsSupported = await checkThreadsSupport();

    if ( haveSIMD )
    {
        if ( threadsSupported )
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
    switch ( wasmType )
    {
        case WasmType.AdvancedWithThreads:
            return "advanced-threads";
        case WasmType.Advanced:
            return "advanced";
        case WasmType.Basic:
            return "basic";
    }
}
