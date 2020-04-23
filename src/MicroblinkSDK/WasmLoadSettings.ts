import { defaultWasmModuleName } from "../defaultWasmModule"

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
     * License key for unlocking the WebAssembly module.
     * License key is bound to the domain name from which the application is served.
     */
    licenseKey: string;

    /**
     * Whether or not WASM should be loaded on the WebWorker (recommended).
     * Set this to false only for debugging purposes, as performing image processing tasks
     * on UI thread may reduce the page responsiveness.
     */
    useWebWorker: boolean = true;

    /**
     * Name of the file containing the WebAssembly module.
     * Change this only if you have renamed the original WASM and its support JS file
     * for your purposes.
     */
    wasmModuleName: string = defaultWasmModuleName;

    /**
     * Optional callback function that will report the SDK loading progress.
     * This can be useful for displaying progress bar for users on slow connections.
     */
    loadProgressCallback: OptionalLoadProgressCallback = null;

    /**
     * @param licenseKey License key for unlocking the WebAssembly module.
     */
    constructor( licenseKey: string )
    {
        this.licenseKey = licenseKey;
    }
};
