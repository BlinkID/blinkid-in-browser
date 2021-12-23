/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { WasmSDKWorker } from "./worker/WorkerSDKBackend";
import { Recognizer, RecognizerRunner, WasmSDK } from "./DataStructures";
import { MetadataCallbacks } from "./MetadataCallbacks";
import { WasmSDKLoadSettings } from "./WasmLoadSettings";


import { SDKError } from "./SDKError";
import * as ErrorTypes from "./ErrorTypes";

export * from "./CameraUtils";
export * from "./DataStructures";
export * from "./DeviceUtils";
export * from "./ErrorTypes";
export * from "./FrameCapture";
export * from "./License";
export * from "./MetadataCallbacks";
export * from "./SDKError";
export * from "./VideoRecognizer";
export * from "./WasmLoadSettings";
export * from "./WasmLoadUtils";

// taken from https://stackoverflow.com/a/2117523/213057
/* eslint-disable */
function uuidv4(): string
{
    return ( ( [1e7] as any )+-1e3+-4e3+-8e3+-1e11 ).replace( /[018]/g, ( c: any ) =>
        ( c ^ crypto.getRandomValues( new Uint8Array( 1 ) )[0] & 15 >> c / 4 ).toString( 16 )
    );
}
/* eslint-enable */

function getUserID(): string
{
    try
    {
        let userId = localStorage.getItem( "mb-user-id" );
        if ( userId === null )
        {
            userId = uuidv4();
            localStorage.setItem( "mb-user-id", userId );
        }
        return userId;
    }
    catch ( error )
    {
        // local storage is disabled, generate new user ID every time
        return uuidv4();
    }
}


/**
 * Asynchronously loads and compiles the WebAssembly module.
 * @param loadSettings Object defining the settings for loading the WebAssembly module.
 * @returns Promise that resolves if WebAssembly module was successfully loaded and rejects if not.
 */
/* eslint-disable @typescript-eslint/no-explicit-any,
                  @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-call */
export async function loadWasmModule( loadSettings: WasmSDKLoadSettings ): Promise< any >
{
    return new Promise< any >
    (
        ( resolve, reject ) =>
        {
            if ( !loadSettings || typeof loadSettings !== "object" )
            {
                reject( new SDKError( ErrorTypes.sdkErrors.wasmSettingsMissing ) );
                return;
            }
            if ( typeof loadSettings.licenseKey !== "string" )
            {
                reject( new SDKError( ErrorTypes.sdkErrors.licenseKeyMissing ) );
                return;
            }
            if ( !loadSettings.wasmModuleName )
            {
                reject( new SDKError( ErrorTypes.sdkErrors.wasmModuleNameMissing ) );
                return;
            }
            if ( typeof loadSettings.engineLocation !== "string" )
            {
                reject( new SDKError( ErrorTypes.sdkErrors.engineLocationInvalid ) );
                return;
            }
            // obtain user ID from local storage
            const userId = getUserID();


            try
            {
                const blob = new Blob( [ String.raw`@PLACEHOLDER:worker` ], { type: "application/javascript" } );
                const url = URL.createObjectURL( blob );
                const worker = new Worker( url );

                WasmSDKWorker.createWasmWorker( worker, loadSettings, userId ).then
                (
                    wasmSDK =>
                    {
                        resolve( wasmSDK );
                    },
                    reject
                );
            }
            catch ( initError )
            {
                reject( initError );
            }
        }
    );
}
/* eslint-enable @typescript-eslint/no-explicit-any,
                 @typescript-eslint/no-unsafe-assignment,
                 @typescript-eslint/no-unsafe-member-access,
                 @typescript-eslint/no-unsafe-call */

/**
 * Function for creating a new RecognizerRunner.
 * Note that it is currently not possible to have multiple instances of RecognizerRunner per instance of WasmSDK.
 * Attempt to create new instance of RecognizerRunner prior deleting the previous one will fail.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 * @param recognizers Array of recognizers that will be used by RecognizerRunner.
 * @param allowMultipleResults Whether or not it is allowed to return multiple results from single recognition session.
 *        See README.md for more information.
 * @param metadataCallbacks
 */
export async function createRecognizerRunner
(
    wasmSDK:                WasmSDK,
    recognizers:            Array< Recognizer >,
    allowMultipleResults  = false,
    metadataCallbacks:      MetadataCallbacks = {}
): Promise< RecognizerRunner >
{
    if ( typeof wasmSDK !== "object" )
    {
        throw new SDKError( ErrorTypes.sdkErrors.missing );
    }
    if ( typeof recognizers !== "object" || recognizers.length < 1 )
    {
        throw new SDKError( ErrorTypes.sdkErrors.recognizersMissing );
    }
    return wasmSDK.mbWasmModule.createRecognizerRunner( recognizers, allowMultipleResults, metadataCallbacks );
}
