/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

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
 * Check if current browser is in-app / embedded.
 * Detects Instagram, Facebook, LinkedIn, Twitter, WeChat, Whatsapp, and Tiktok.
 * @returns Boolean whether the browser is in-app or not
 */
export function isInAppBrowser(): boolean
{
    const inAppRegex = /(instagram|fbav|linkedinapp|twitter|micromessenger|whatsapp|tiktok)[/\s]?([\w.]*)/i;
    const userAgent = navigator.userAgent || navigator.vendor;

    return !!inAppRegex.exec( userAgent );
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
