/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { AdditionalProcessingInfo } from "./AdditionalProcessingInfo";
import { BlinkIdSingleSideRecognizerSettings, BaseBlinkIdRecognizerResult } from "./BlinkIdSingleSideRecognizer";
import { CameraFrameResult, ImageResult } from "../ImageOptions";
import { DataMatchResult } from "./DataMatch";
import { ImageAnalysisResult } from "./ImageAnalysisResult";
import { ProcessingStatus } from "./ProcessingStatus";
import { VIZResult } from "./VIZResult";

import
{
    Recognizer,
    WasmSDK
} from "../../../MicroblinkSDK/DataStructures";

/**
 * A settings object that is used for configuring the BlinkIdMultiSideRecognizer.
 */
export class BlinkIdMultiSideRecognizerSettings extends BlinkIdSingleSideRecognizerSettings
{
    /**
     * Proceed to scan the back side of a document even if some of the validity checks have failed while scanning the
     * front side of a document.
     */
    allowUncertainFrontSideScan = false;

    /**
     * Configure the number of characters per field that are allowed to be inconsistent in data match.
     */
    maxAllowedMismatchesPerField = 0;

    /**
     * Back side of the document will not be scanned if only the front side is supported for a specific document.
     *
     * If set to false, a photo of the back side will be returned, as well as barcode or MRZ (Machine Readable Zone) if
     * either is present.
     */
    skipUnsupportedBack = false;
}

/**
 * The result of image recognition when using the BlinkIdMultiSideRecognizer.
 */
export interface BlinkIdMultiSideRecognizerResult extends BaseBlinkIdRecognizerResult
{
    /**
     * Detailed information about missing, invalid and extra fields.
     */
    readonly backAdditionalProcessingInfo: AdditionalProcessingInfo;

    /**
     * Detailed information about missing, invalid and extra fields.
     */
    readonly frontAdditionalProcessingInfo: AdditionalProcessingInfo;

    /**
     * Full video feed frame from which barcode data was extracted.
     */
    readonly barcodeCameraFrame: CameraFrameResult;

    /**
     * Full video feed frame from which document data on front side was extracted.
     */
    readonly frontCameraFrame: CameraFrameResult;

    /**
     * Full video feed frame from which document data on back side was extracted.
     */
    readonly backCameraFrame: CameraFrameResult;

    /**
     * Cropped and dewarped back side image of a document that has been scanned.
     */
    readonly fullDocumentBackImage: ImageResult;

    /**
     * Cropped and dewarped front side image of a document that has been scanned.
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

    /**
     * The result of the data matching algorithm for scanned parts/sides of the document.
     *
     * For example if date of expiry is scanned from the front and back side of the document and
     * values do not match, this method will return {@link DataMatchResult#Failed} for that specific
     * field, and for data match on the whole document.
     *
     * Result for the whole document will be {@link DataMatchResult#Success} only if scanned values
     * for all fields that are compared are the same. If data matching has not been performed,
     * result will be {@link DataMatchResult#NotPerformed}.
     */
    readonly dataMatchResult: DataMatchResult;

    /**
     * {@code true} if recognizer has finished scanning first side and is now scanning back side,
     * {@code false} if it's still scanning first side.
     */
    readonly scanningFirstSideDone: boolean;
}

/**
 * The Blink ID MultiSide Recognizer is used for scanning both sides of any ID document.
 */
export interface BlinkIdMultiSideRecognizer extends Recognizer
{
    /** Returns the currently applied BlinkIdMultiSideRecognizerSettings. */
    currentSettings(): Promise< BlinkIdMultiSideRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: BlinkIdMultiSideRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< BlinkIdMultiSideRecognizerResult >;
}

/**
 * This function is used to create a new instance of `BlinkIdMultiSideRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createBlinkIdMultiSideRecognizer( wasmSDK: WasmSDK ): Promise< BlinkIdMultiSideRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer( "BlinkIdMultiSideRecognizer" ) as Promise< BlinkIdMultiSideRecognizer >;
}
