/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { defaultWasmModuleName } from "../defaultWasmModule";
import { WasmType } from "./WasmType";

/**
 * Function that will be called during loading of the SDK.
 * @param loadPercentage Number between 0 and 100 indicating the loading progress.
 */
export type LoadProgressCallback = ( loadPercentage: number ) => void;

export type OptionalLoadProgressCallback = LoadProgressCallback | null;

export { WasmType };

/**
 * Settings object for function loadWasmModule.
 */
export class WasmSDKLoadSettings
{
    /**
     * License key for unlocking the WebAssembly module. Bound to the domain name from which the application is served.
     */
    licenseKey: string;

    /**
     * Write a hello message to the browser console when license check is successfully performed.
     *
     * Hello message will contain the name and version of the SDK, which are required information for all support
     * tickets.
     *
     * The default value is true.
     */
    allowHelloMessage = true;

    /**
     * Absolute location of WASM and related JS/data files. Useful when resource files should be loaded over CDN, or
     * when web frameworks/libraries are used which store resources in specific locations, e.g. inside "assets" folder.
     *
     * Important: if the engine is hosted on another origin, CORS must be enabled between two hosts. That is, server
     * where engine is hosted must have 'Access-Control-Allow-Origin' header for the location of the web app.
     *
     * Important: SDK and WASM resources must be from the same version of a package.
     *
     * Default value is empty string, i.e. "". In case of empty string, value of "window.location.origin" property is
     * going to be used.
     */
    engineLocation = "";

    /**
     * Type of the WASM that will be loaded. By default, if not set, the SDK will automatically determine the best WASM
     * to load.
     */
    wasmType: WasmType | null = null;

    /**
     * Defines the number of workers that will be used for multi-threaded processing of the images. If not set, the
     * number of worker used will match the number of detected CPU cores on a device.
     *
     * If the browser does not support multi-threaded processing or it was deliberately disabled using the `wasmType`
     * property, then this property will be ignored.
     */
    numberOfWorkers: number | null = null;

    /**
     * Optional callback function that will report the SDK loading progress.
     *
     * This can be useful for displaying progress bar to users with slow connections.
     *
     * The default value is null.
     */
    loadProgressCallback: OptionalLoadProgressCallback = null;


    /**
     * Name of the file containing the WebAssembly module.
     *
     * Change this only if you have renamed the original WASM and its support JS file for your purposes.
     */
    wasmModuleName: string = defaultWasmModuleName;

    /**
     * @param licenseKey License key for unlocking the WebAssembly module.
     */
    constructor( licenseKey: string )
    {
        if ( !licenseKey )
        {
            throw new Error( "Missing license key!" );
        }
        this.licenseKey = licenseKey;
    }
}
