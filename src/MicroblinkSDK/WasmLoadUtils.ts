/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import {
    bulkMemory,
    mutableGlobals,
    referenceTypes,
    saturatedFloatToInt,
    signExtensions,
    simd,
    threads,
} from "wasm-feature-detect";

import { WasmType } from "./WasmType";

function isIOSUserAgent()
{
    const pattern = /iOS|iPhone|iPad|iPod/i; // 'i' flag for case-insensitive matching
    return pattern.test( navigator.userAgent );
}
/* eslint-disable max-len */
/**
 * Safari 16 shipped with WASM threads support, but it didn't ship with nested
 * workers support, so an extra check is needed
 * https://github.com/GoogleChromeLabs/squoosh/pull/1325/files#diff-904900db64cd3f48b0e765dbbdc6a218a7ea74a199671bde82a8944a904db86f
 */
/* eslint-enable max-len */
export default async function checkThreadsSupport(): Promise<boolean>
{
    const supportsWasmThreads = await threads();
    if ( !supportsWasmThreads ) return false;

    if ( !( "importScripts" in self ) )
    {
        throw Error( "Not implemented" );
    }

    // Safari has issues with shared memory
    // https://github.com/emscripten-core/emscripten/issues/19374
    if ( isIOSUserAgent() )
    {
        return false;
    }

    return "Worker" in self;
}

export async function detectWasmFeatures(): Promise<WasmType>
{
    const basicSet = [
        mutableGlobals(),
        referenceTypes(),
        bulkMemory(),
        saturatedFloatToInt(),
        signExtensions(),
    ];

    const supportsBasic = ( await Promise.all( basicSet ) ).every( Boolean );

    if ( !supportsBasic )
    {
        throw new Error( "Browser doesn't meet minimum requirements!" );
    }

    const supportsAdvanced = await simd();

    if ( !supportsAdvanced )
    {
        return WasmType.Basic;
    }

    const supportsAdvancedThreads = await checkThreadsSupport();

    if ( !supportsAdvancedThreads )
    {
        return WasmType.Advanced;
    }

    return WasmType.AdvancedWithThreads;
}


export async function detectWasmType(): Promise<WasmType>
{
    // determine if all features required for advanced WASM are available
    // currently, advanced wasm requires SIMD

    const haveSIMD = await simd();

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
