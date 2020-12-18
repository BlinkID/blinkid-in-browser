/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import
{
    Recognizer,
    RecognizerResult,
    WasmSDK,
    ImageOrientation
} from "../MicroblinkSDK/DataStructures";

/**
 * The result object of the SuccessFrameGrabberRecognizer.
 */
export interface SuccessFrameGrabberRecognizerResult extends RecognizerResult
{
    /**
     * Camera frame on which given recognizer's result ha become valid.
     * If given recognizer's result never became valid, contains null.
     */
    readonly successFrame: ImageData | null;

    /**
     * Orientation of the success frame.
     */
    readonly frameOrientation: ImageOrientation;
}

/**
 * Recognizer that can wrap another recognizer and capture the frame on which
 * the wrapped recognizer has succeeded to recognize.
 */
export interface SuccessFrameGrabberRecognizer< T extends Recognizer > extends Recognizer
{
    /**
     * Reference to recognizer that is being wrapped by this
     * SuccessFrameGrabberRecognizer.
     */
    readonly wrappedRecognizer: T;

    /**
     * Returns the current result of the recognition. Note that result will not
     * contain the result of the wrapped recognizer. To obtain that result, call
     * getResult on wrapped recognizer.
     */
    getResult(): Promise< SuccessFrameGrabberRecognizerResult >;

    /**
     * Cleans up the object from the WebAssembly heap.
     */
    delete(): Promise< void >;
}

/**
 * Creates a new instance of `SuccessFrameGrabberRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the
 *        WebAssembly module.
 * @param slaveRecognizer Instance of Recognizer that will be wrapped.
 */
export async function createSuccessFrameGrabberRecognizer< T extends Recognizer >
(
    wasmSDK:            WasmSDK,
    slaveRecognizer:    T
): Promise< SuccessFrameGrabberRecognizer < T > >
{
    // taken from https://stackoverflow.com/a/53615996
    const sfgr = await wasmSDK.mbWasmModule.newRecognizer
    (
        "SuccessFrameGrabberRecognizer",
        slaveRecognizer
    ) as SuccessFrameGrabberRecognizer< T >;
    type MutableSFGR = {
        -readonly [ K in keyof SuccessFrameGrabberRecognizer< T > ]: SuccessFrameGrabberRecognizer< T >[ K ]
    }
    const mutableSFGR: MutableSFGR = sfgr;
    mutableSFGR.wrappedRecognizer = slaveRecognizer;
    return sfgr;
}
