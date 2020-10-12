
import { WasmSDKWorker } from "./worker/WorkerSDKBackend";
import { Recognizer, RecognizerRunner, WasmSDK } from "./DataStructures";
import { MetadataCallbacks } from "./MetadataCallbacks";
import { WasmSDKLoadSettings } from "./WasmLoadSettings";


export * from "./DataStructures";
export * from "./MetadataCallbacks";
export * from "./FrameCapture";
export * from "./VideoRecognizer";
export * from "./WasmLoadSettings";

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
 * Check if browser supports ES6, which is prerequisite for this SDK to execute.
 *
 * IMPORTANT: it's not possible to run this function from MicroblinkSDK if browser doesn't support
 * ES6 since this file won't be able to load.
 *
 * This function is here as a placeholder so it can be copied to standalone JS file or directly into 'index.html'.
 */
// export function isES6Supported(): boolean
// {
//     if ( typeof Symbol === "undefined" )
//     {
//         return false;
//     }
//     try
//     {
//         eval( "class Foo {}" );
//         eval( "var bar = (x) => x+1" );
//     }
//     catch ( e )
//     {
//         return false;
//     }
//     return true;
// }

/**
 * Checks if browser is supported by the SDK. The minimum requirements for the browser is
 * the support for WebAssembly. If your browser does not support executing WebAssembly,
 * this function will return `false`.
 */
export function isBrowserSupported(): boolean
{
    // based on https://stackoverflow.com/a/47880734
    try
    {
        if ( typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function" )
        {
            const module = new WebAssembly.Module( Uint8Array.of( 0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00 ) );
            if ( module instanceof WebAssembly.Module )
                return new WebAssembly.Instance( module ) instanceof WebAssembly.Instance;
        }
    }
    catch ( ignored )
    {
        return false;
    }
    return false;
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
                reject( "Missing WASM load settings!" );
                return;
            }
            if ( typeof loadSettings.licenseKey !== "string" )
            {
                reject( "Missing license key!" );
                return;
            }
            if ( !loadSettings.wasmModuleName )
            {
                reject( "Missing WASM module name!" );
                return;
            }
            if ( typeof loadSettings.engineLocation !== "string" )
            {
                reject( "Setting property 'engineLocation' must be a string!" );
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
        throw new Error( "SDK is not provided!" );
    }
    if ( typeof recognizers !== "object" || recognizers.length < 1 )
    {
        throw new Error( "To create RecognizerRunner at least 1 recognizer is required." );
    }
    return wasmSDK.mbWasmModule.createRecognizerRunner( recognizers, allowMultipleResults, metadataCallbacks );
}
