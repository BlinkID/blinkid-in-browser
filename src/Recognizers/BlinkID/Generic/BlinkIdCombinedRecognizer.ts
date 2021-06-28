/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { BlinkIdRecognizerSettings, BaseBlinkIdRecognizerResult } from "./BlinkIdRecognizer";
import { CombinedRecognizerResult } from "../CombinedRecognizer";
import { ImageAnalysisResult } from "./ImageAnalysisResult";
import { ImageResult } from "../ImageOptions";
import { ProcessingStatus } from "./ProcessingStatus";
import { VIZResult } from "./VIZResult";

import
{
    Recognizer,
    DigitalSignatureOptions,
    DigitalSignature,
    WasmSDK
} from "../../../MicroblinkSDK/DataStructures";

/**
 * A settings object that is used for configuring the BlinkIdCombinedRecognizer.
 */
export class BlinkIdCombinedRecognizerSettings extends BlinkIdRecognizerSettings implements DigitalSignatureOptions
{
    /**
     * Proceed with scanning the back side even if the front side result is uncertain.
     * This only works for still images - video feeds will ignore this setting.
     */
    allowUncertainFrontSideScan = false;

    /**
     * Configure the number of characters per field that are allowed to be inconsistent in data match.
     */
    maxAllowedMismatchesPerField = 0;

    // implementation od the DigitalSignatureOptions interface
    allowSignature = false;
}

/**
 * The result of image recognition when using the BlinkIdCombinedRecognizer.
 */
export interface BlinkIdCombinedRecognizerResult extends BaseBlinkIdRecognizerResult, CombinedRecognizerResult
{
    /**
     *  The digital signature
     */
    readonly digitalSignature: DigitalSignature;

    /**
     *  The full document back image
     */
    readonly fullDocumentBackImage: ImageResult;

    /**
     *  The full document front image
     */
    readonly fullDocumentFrontImage: ImageResult;

    /**
     * Result of analysis of the image of the front side of the document.
     */
    readonly frontImageAnalysisResult: ImageAnalysisResult;

    /**
     * Result of analysis of the image of the back side of the document.
     */
    readonly backImageAnalysisResult: ImageAnalysisResult;

    /**
     * The data extracted from the front side visual inspection zone.
     */
    readonly frontViz: VIZResult;

    /**
     * The data extracted from the back side visual inspection zone.
     */
    readonly backViz: VIZResult;

    /**
     * Status of the last recognition process for the front side of the document.
     */
    readonly frontProcessingStatus: ProcessingStatus;

    /**
     * Status of the last recognition process for the back side of the document.
     */
    readonly backProcessingStatus: ProcessingStatus;
}

/**
 * The Blink ID Combined Recognizer is used for scanning both sides of any ID document.
 */
export interface BlinkIdCombinedRecognizer extends Recognizer
{
    /** Returns the currently applied BlinkIdCombinedRecognizerSettings. */
    currentSettings(): Promise< BlinkIdCombinedRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: BlinkIdCombinedRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< BlinkIdCombinedRecognizerResult >;
}

/**
 * This function is used to create a new instance of `BlinkIdCombinedRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createBlinkIdCombinedRecognizer( wasmSDK: WasmSDK ): Promise< BlinkIdCombinedRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer( "BlinkIdCombinedRecognizer" ) as Promise< BlinkIdCombinedRecognizer >;
}
