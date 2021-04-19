/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { WasmType } from "./WasmType";

/* eslint-disable @typescript-eslint/no-unsafe-assignment,
                     @typescript-eslint/no-unsafe-call,
                     @typescript-eslint/no-explicit-any,
                     @typescript-eslint/no-unsafe-return,
                     @typescript-eslint/no-unsafe-assignment,
                     @typescript-eslint/explicit-module-boundary-types,
                     @typescript-eslint/no-unsafe-member-access */
export function setupModule( module: any, allowedThreads: number | null, jsPath: string | null ): any
{
    if ( allowedThreads && allowedThreads > 0 )
    {
        module = Object.assign
        (
            module,
            {
                allowedThreads: allowedThreads
            }
        );
    }
    if ( jsPath !== null )
    {
        module = Object.assign
        (
            module,
            {
                mainScriptUrlOrBlob: jsPath
            }
        );
    }
    return module;
}

export async function waitForThreadWorkers( wasmModule: any )
{
    if ( wasmModule[ "threadWorkersReadyPromise" ] )
    {
        await wasmModule[ "threadWorkersReadyPromise" ];
    }
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment,
                     @typescript-eslint/no-unsafe-call,
                     @typescript-eslint/no-unsafe-return,
                     @typescript-eslint/no-unsafe-assignment,
                     @typescript-eslint/explicit-module-boundary-types,
                     @typescript-eslint/no-unsafe-member-access */

export function supportsThreads( wasmType: WasmType ): boolean
{
    return wasmType === WasmType.AdvancedWithThreads;
}
