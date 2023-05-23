/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { AdditionalProcessingInfo } from "./AdditionalProcessingInfo";
import { AnonymizationMode } from "./AnonymizationMode";
import { BarcodeResult } from "./BarcodeResult";
import { ClassInfo } from "./ClassInfo";
import { DriverLicenseDetailedInfo } from "./DriverLicenseDetailedInfo";
import { DateResult, StringResult } from "./GenericResultStructures";
import { ImageAnalysisResult } from "./ImageAnalysisResult";
import { ProcessingStatus } from "./ProcessingStatus";
import { RecognitionMode } from "./RecognitionMode";
import { RecognitionModeFilter } from "./RecognitionModeFilter";
import { VIZResult } from "./VIZResult";

import {
    CameraFrameResult,
    ExtensionFactors,
    FaceImageOptions,
    FullDocumentImageOptions,
    ImageResult,
    SignatureImageOptions,
    validateDpi,
} from "../ImageOptions";

import { MrzResult } from "../MRTD/MrtdStructures";

import { Recognizer, RecognizerResult, RecognizerSettings, WasmSDK } from "../../../MicroblinkSDK/DataStructures";

// required for the final SDK
export * from "./AddressDetailedInfo";
export * from "./AnonymizationMode";
export * from "./BarcodeResult";
export * from "./ClassInfo";
export * from "./DriverLicenseDetailedInfo";
export * from "./ImageAnalysisResult";
export * from "./GenericResultStructures";
export * from "./ProcessingStatus";
export * from "./RecognitionMode";
export * from "./RecognitionModeFilter";
export * from "./VIZResult";

/**
 * A barcode scanning started callback function.
 */
export type BarcodeScanningStartedCallback = () => void;

/**
 * A classifier callback function.
 * @param supported True if document is supported for recognition, false otherwise.
 */
export type ClassifierCallback = ( supported: boolean ) => void;

/**
 * A settings object that is used for configuring the BlinkIdSingleSideRecognizer.
 */
export class BlinkIdSingleSideRecognizerSettings
implements RecognizerSettings, FullDocumentImageOptions, FaceImageOptions, SignatureImageOptions
{
    /**
     * Skip processing of the blurred frames.
     */
    allowBlurFilter = true;

    /**
     * Allow reading of non-standard MRZ (Machine Readable Zone). Only raw MRZ result is returned.
     * Final recognizer state is not affected.
     */
    allowUnparsedMrzResults = false;

    /**
     * Allow reading of standard MRZ (Machine Readable Zone) which gets successfully parsed, but check digits are
     * incorrect (do not comply with the ICAO standard).
     *
     * Final recognizer state is not affected.
     */
    allowUnverifiedMrzResults = true;

    /**
     * Enable or disable recognition of specific document groups supported by the current license.
     * By default all modes are enabled.
     */
    recognitionModeFilter = new RecognitionModeFilter();

    /**
     * Save the raw camera frames at the moment of the data extraction or timeout.
     * This significantly increases memory consumption. The scanning performance is not affected.
     */
    saveCameraFrames = false;

    /**
     * Process only cropped document images with corrected perspective (frontal images of a document).
     * This only applies to still images - video feed will ignore this setting.
     */
    scanCroppedDocumentImage = false;

    /**
     * Allow only results containing expected characters for a given field.
     *
     * Each field is validated against a set of rules.
     *
     * All fields have to be successfully validated in order for a recognizer state to be ‘valid’.
     * Setting is used to improve scanning accuracy.
     */
    validateResultCharacters = true;

    /**
     * Redact specific fields based on requirements or laws regarding a specific document.
     *
     * Data can be redacted from the image, the result or both.
     *
     * The setting applies to certain documents only.
     */
    anonymizationMode = AnonymizationMode.FullResult;

    /**
     * Called when barcode scanning step starts.
     */
    barcodeScanningStartedCallback: BarcodeScanningStartedCallback | null = null;

    /**
     * Called when recognizer classifies a document.
     */
    classifierCallback: ClassifierCallback | null = null;

    /**
     * If set to `null`, all supported documents will be recognized.
     * Otherwise, only classes from given array will be recognized and all other
     * documents will be treated as "not supported" (observable via classifierCallback).
     */
    allowedDocumentClasses: Array<ClassInfo> | null = null;

    /**
     * Minimum required distance between the edge of the scanning frame and the document.
     *
     * Defined as a percentage of the frame width.
     *
     * Default value is 0.0f in which case the padding edge and the image edge are the same.
     * Alternative recommended value is 0.02f.
     */
    paddingEdge = 0.0;

    // implementation of the FullDocumentImageOptions interface
    returnFullDocumentImage = false;

    returnEncodedFullDocumentImage = false;

    private _fullDocumentImageDpi = 250;

    get fullDocumentImageDpi(): number
    {
        return this._fullDocumentImageDpi;
    }

    set fullDocumentImageDpi( value: number )
    {
        validateDpi( value );
        this._fullDocumentImageDpi = value;
    }

    fullDocumentImageExtensionFactors = new ExtensionFactors();

    // implementation of the FaceImageOptions interface
    returnFaceImage = false;

    returnEncodedFaceImage = false;

    private _faceImageDpi = 250;

    get faceImageDpi(): number
    {
        return this._faceImageDpi;
    }

    set faceImageDpi( value: number )
    {
        validateDpi( value );
        this._faceImageDpi = value;
    }

    // implementation of the SignatureImageOptions interface
    returnSignatureImage = false;

    returnEncodedSignatureImage = false;

    private _signatureImageDpi = 250;

    get signatureImageDpi(): number
    {
        return this._signatureImageDpi;
    }

    set signatureImageDpi( value: number )
    {
        validateDpi( value );
        this._signatureImageDpi = value;
    }
}

/**
 * The base result of image recognition when using either the BlinkIdSingleSideRecognizer or BlinkIdMultiSideRecognizer.
 */
export interface BaseBlinkIdRecognizerResult extends RecognizerResult {
    /**
     * The additional address information of the document owner.
     */
    readonly additionalAddressInformation: StringResult;

    /**
     * The additional name information of the document owner.
     */
    readonly additionalNameInformation: StringResult;

    /**
     * The one more additional address information of the document owner.
     */
    readonly additionalOptionalAddressInformation: StringResult;

    /**
     * The fathers name of the document owner.
     */
    readonly fathersName: StringResult;

    /**
     * The mothers name of the document owner.
     */
    readonly mothersName: StringResult;

    /**
     * The address of the document owner.
     */
    readonly address: StringResult;

    /**
     * The data extracted from the barcode.
     */
    readonly barcode: BarcodeResult;

    /**
     * The class info
     */
    readonly classInfo: ClassInfo;

    /**
     * The date of birth of the document owner.
     */
    readonly dateOfBirth: DateResult;

    /**
     * The date of expiry of the document.
     */
    readonly dateOfExpiry: DateResult;

    /**
     * Determines if date of expiry is permanent.
     */
    readonly dateOfExpiryPermanent: boolean;

    /**
     * The date of issue of the document.
     */
    readonly dateOfIssue: DateResult;

    /**
     * The additional number of the document.
     */
    readonly documentAdditionalNumber: StringResult;

    /**
     * The one more additional number of the document.
     */
    readonly documentOptionalAdditionalNumber: StringResult;

    /**
     * The document number.
     */
    readonly documentNumber: StringResult;

    /**
     * The driver license detailed info
     */
    readonly driverLicenseDetailedInfo: DriverLicenseDetailedInfo;

    /**
     * The employer of the document owner.
     */
    readonly employer: StringResult;

    /**
     * The face image
     */
    readonly faceImage: ImageResult;

    /**
     * The first name of the document owner.
     */
    readonly firstName: StringResult;

    /**
     * The full name of the document owner.
     */
    readonly fullName: StringResult;

    /**
     * The issuing authority of the document.
     */
    readonly issuingAuthority: StringResult;

    /**
     * The last name of the document owner.
     */
    readonly lastName: StringResult;

    /**
     * The localized name of the document owner.
     */
    readonly localizedName: StringResult;

    /**
     * The marital status of the document owner.
     */
    readonly maritalStatus: StringResult;

    /**
     * The data extracted from the machine readable zone.
     */
    readonly mrz: MrzResult;

    /**
     * The nationality of the documet owner.
     */
    readonly nationality: StringResult;

    /**
     * The personal identification number.
     */
    readonly personalIdNumber: StringResult;

    /**
     * The place of birth of the document owner.
     */
    readonly placeOfBirth: StringResult;

    /**
     * Status of the last recognition process.
     */
    readonly processingStatus: ProcessingStatus;

    /**
     * The profession of the document owner.
     */
    readonly profession: StringResult;

    /**
     * The race of the document owner.
     */
    readonly race: StringResult;

    /**
     * Recognition mode used to scan current document.
     */
    readonly recognitionMode: RecognitionMode;

    /**
     * The religion of the document owner.
     */
    readonly religion: StringResult;

    /**
     * The residential status of the document owner.
     */
    readonly residentialStatus: StringResult;

    /**
     * The sex of the document owner.
     */
    readonly sex: StringResult;

    /**
     * The image of the signature
     */
    readonly signatureImage: ImageResult;
}

/**
 * The result of image recognition when using the BlinkIdSingleSideRecognizer.
 */
export interface BlinkIdSingleSideRecognizerResult extends BaseBlinkIdRecognizerResult {
    /**
     * Detailed information about missing, invalid and extra fields.
     */
    readonly additionalProcessingInfo: AdditionalProcessingInfo;

    /**
     * Full video feed frame from which barcode data was extracted.
     */
    readonly barcodeCameraFrame: CameraFrameResult;

    /**
     * Full video feed frame from which document data was extracted.
     */
    readonly cameraFrame: CameraFrameResult;

    /**
     * Cropped and dewarped image of a document that has been scanned.
     */
    readonly fullDocumentImage: ImageResult;

    /**
     * Result of document image analysis.
     */
    readonly imageAnalysisResult: ImageAnalysisResult;

    /**
     * The data extracted from the visual inspection zone.
     */
    readonly viz: VIZResult;
}

/**
 * The Blink ID Recognizer is used for scanning any ID document.
 */
export interface BlinkIdSingleSideRecognizer extends Recognizer {
    /** Returns the currently applied BlinkIdSingleSideRecognizerSettings. */
    currentSettings(): Promise<BlinkIdSingleSideRecognizerSettings>;

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: BlinkIdSingleSideRecognizerSettings ): Promise<void>;

    /** Returns the current result of the recognition. */
    getResult(): Promise<BlinkIdSingleSideRecognizerResult>;
}

/**
 * This function is used to create a new instance of `BlinkIdSingleSideRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createBlinkIdSingleSideRecognizer( wasmSDK: WasmSDK ): Promise<BlinkIdSingleSideRecognizer>
{
    return wasmSDK.mbWasmModule.newRecognizer( "BlinkIdSingleSideRecognizer" ) as Promise<BlinkIdSingleSideRecognizer>;
}
