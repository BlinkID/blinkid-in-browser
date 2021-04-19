/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * Defines the type of the WASM that will be loaded.
 */
export enum WasmType
{
    /**
     * The WASM that will be loaded will be most compatible with all browsers that
     * support the WASM, but will lack features that could be used to improve performance.
     */
    Basic = "BASIC",

    /**
     * The WASM that will be loaded will be built with advanced WASM features, such as
     * bulk memory, non-trapping floating point and sign extension. Such WASM can only
     * be executed in browsers that support those features. Attempting to run this
     * WASM in a non-compatible browser will crash your app.
     */
    Advanced = "ADVANCED",

    /**
     * The WASM that will be loaded will be build with advanced WASM features, just
     * like above. Additionally, it will be also built with support for multi-threaded
     * processing. This feature requires a browser with support for both advanced WASM
     * features and `SharedArrayBuffer`
     */
    AdvancedWithThreads = "ADVANCED_WITH_THREADS"
}
