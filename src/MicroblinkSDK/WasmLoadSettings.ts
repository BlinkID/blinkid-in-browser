import { defaultWasmModuleName } from "../defaultWasmModule";

/**
 * Function that will be called during loading of the SDK.
 * @param loadPercentage Number between 0 and 100 indicating the loading progress.
 */
export type LoadProgressCallback = ( loadPercentage: number ) => void;

export type OptionalLoadProgressCallback = LoadProgressCallback | null;

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
     * Default value is true.
     */
    allowHelloMessage = true;

    /**
     * Location of WASM and related JS/data files. Useful when resource files should be loaded over CDN, or when web
     * frameworks/libraries are used which store resources in specific locations, e.g. inside "assets" folder.
     *
     * If relative path is defined, the path will be resolved relative to the location of worker file.
     *
     * Important: if engine is hosted on another origin, CORS must be enabled between two hosts. That is, server where
     * engine is hosted must have 'Access-Control-Allow-Origin' header for the location of the web app.
     *
     * Important: SDK, worker script and WASM resources must be from the same version of package.
     *
     * Default value is empty string, i.e. "".
     */
    engineLocation = "";

    /**
     * Optional callback function that will report the SDK loading progress.
     *
     * This can be useful for displaying progress bar for users on slow connections.
     *
     * Default value is null.
     */
    loadProgressCallback: OptionalLoadProgressCallback = null;

    /**
     * Whether or not WASM should be loaded on the WebWorker (recommended).
     *
     * Set this to false only for debugging purposes, as performing image processing tasks on UI thread may reduce the
     * page responsiveness.
     */
    useWebWorker = true;

    /**
     * Name of the file containing the WebAssembly module.
     *
     * Change this only if you have renamed the original WASM and its support JS file for your purposes.
     */
    wasmModuleName: string = defaultWasmModuleName;

    /**
     * Location of Web Worker script file. Useful when web frameworks/libraries are used which store
     * resources in specific locations, e.g. inside "assets" folder.
     *
     * Important: worker must be served via HTTPS and must be on the same origin as the initiator.
     * See https://github.com/w3c/ServiceWorker/issues/940 (same applies for Web Workers).
     *
     * Important: SDK, worker script and WASM resources must be from the same version of package.
     *
     * Default value is empty string, i.e. "". Valid only if "useWebWorker" is set to "true".
     */
    workerLocation = "";

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
