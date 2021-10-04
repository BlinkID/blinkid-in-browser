/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { AnonymizationMode } from "./AnonymizationMode";
import { BarcodeResult } from "./BarcodeResult";
import { ClassInfo } from "./ClassInfo";
import { DriverLicenseDetailedInfo } from "./DriverLicenseDetailedInfo";
import { ImageAnalysisResult } from "./ImageAnalysisResult";
import { ProcessingStatus } from "./ProcessingStatus";
import { RecognitionMode } from "./RecognitionMode";
import { RecognitionModeFilter } from "./RecognitionModeFilter";
import { VIZResult } from "./VIZResult";

import
{
    ExtensionFactors,
    FaceImageOptions,
    FullDocumentImageOptions,
    ImageResult,
    SignatureImageOptions,
    validateDpi
} from "../ImageOptions";

import { MrzResult } from "../MRTD/MrtdStructures";

import
{
    Recognizer,
    RecognizerResult,
    MBDate,
    RecognizerSettings,
    WasmSDK
} from "../../../MicroblinkSDK/DataStructures";

// required for the final SDK
export * from "./AddressDetailedInfo";
export * from "./AnonymizationMode";
export * from "./BarcodeResult";
export * from "./ClassInfo";
export * from "./DriverLicenseDetailedInfo";
export * from "./ImageAnalysisResult";
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
 * A settings object that is used for configuring the BlinkIdRecognizer.
 */
export class BlinkIdRecognizerSettings implements RecognizerSettings,
                                                  FullDocumentImageOptions,
                                                  FaceImageOptions,
                                                  SignatureImageOptions
{
    /**
     * Defines whether blured frames filtering is allowed.
     */
    allowBlurFilter = true;

    /**
     * Defines whether returning of unparsed MRZ (Machine Readable Zone) results is allowed.
     */
    allowUnparsedMrzResults = false;

    /**
     * Defines whether returning unverified MRZ (Machine Readable Zone) results is allowed.
     * Unverified MRZ is parsed, but check digits are incorrect.
     */
    allowUnverifiedMrzResults = true;

    /**
     * Enable or disable recognition of specific document groups supported by the current license.
     * By default all modes are enabled.
     */
    recognitionModeFilter = new RecognitionModeFilter();

    /**
     * Configure the recognizer to only work on already cropped and dewarped images.
     * This only works for still images - video feeds will ignore this setting.
     */
    scanCroppedDocumentImage = false;

    /**
     * Whether result characters validatation is performed.
     * If a result member contains invalid character, the result state cannot be valid.
     */
    validateResultCharacters = true;

    /**
     * Whether sensitive data should be removed from images, result fields or both.
     * The setting only applies to certain documents.
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
    allowedDocumentClasses: Array< ClassInfo > | null = null;

    /**
     * Padding is a minimum distance from the edge of the frame and it is defined
     * as a percentage of the frame width. Recommended value is '0.02'.
     * By default, this is set to '0.0' which means that padding edge and image edge are the same.
     */
    paddingEdge = 0.0;

    // implementation of the FullDocumentImageOptions interface
    returnFullDocumentImage        = false;

    returnEncodedFullDocumentImage = false;

    private _fullDocumentImageDpi  = 250;

    get fullDocumentImageDpi(): number { return this._fullDocumentImageDpi; }

    set fullDocumentImageDpi( value: number )
    {
        validateDpi( value );
        this._fullDocumentImageDpi = value;
    }

    fullDocumentImageExtensionFactors = new ExtensionFactors();

    // implementation of the FaceImageOptions interface
    returnFaceImage        = false;

    returnEncodedFaceImage = false;

    private _faceImageDpi  = 250;

    get faceImageDpi(): number { return this._faceImageDpi; }

    set faceImageDpi( value: number )
    {
        validateDpi( value );
        this._faceImageDpi = value;
    }

    // implementation of the SignatureImageOptions interface
    returnSignatureImage        = false;

    returnEncodedSignatureImage = false;

    private _signatureImageDpi  = 250;

    get signatureImageDpi(): number { return this._signatureImageDpi; }

    set signatureImageDpi( value: number )
    {
        validateDpi( value );
        this._signatureImageDpi = value;
    }
}

/**
 * The base result of image recognition when using either the BlinkIdRecognizer or BlinkIdCombindedRecognizer.
 */
export interface BaseBlinkIdRecognizerResult extends RecognizerResult
{
    /**
     *  THe additional address information of the document owner.
     */
    readonly additionalAddressInformation: string;

    /**
     *  The additional name information of the document owner.
     */
    readonly additionalNameInformation: string;

    /**
     *  The fathers name of the document owner.
     */
    readonly fathersName: string;

    /**
     *  The mothers name of the document owner.
     */
    readonly mothersName: string;

    /**
     * The address of the document owner.
     */
    readonly address: string;

    /**
     * The data extracted from the barcode.
     */
    readonly barcode: BarcodeResult;

    /**
     *  The class info
     */
    readonly classInfo: ClassInfo;

    /**
     *  The date of birth of the document owner.
     */
    readonly dateOfBirth: MBDate;

    /**
     *  The date of expiry of the document.
     */
    readonly dateOfExpiry: MBDate;

    /**
     *  Determines if date of expiry is permanent.
     */
    readonly dateOfExpiryPermanent: boolean;

    /**
     *  The date of issue of the document.
     */
    readonly dateOfIssue: MBDate;

    /**
     *  The additional number of the document.
     */
    readonly documentAdditionalNumber: string;

    /**
     * The one more additional number of the document.
     */
    readonly documentOptionalAdditionalNumber: string;

    /**
     *  The document number.
     */
    readonly documentNumber: string;

    /**
     *  The driver license detailed info
     */
    readonly driverLicenseDetailedInfo: DriverLicenseDetailedInfo;

    /**
     *  The employer of the document owner.
     */
    readonly employer: string;

    /**
     *  The face image
     */
    readonly faceImage: ImageResult;

    /**
     *  The first name of the document owner.
     */
    readonly firstName: string;

    /**
     *  The full name of the document owner.
     */
    readonly fullName: string;

    /**
     *  The issuing authority of the document.
     */
    readonly issuingAuthority: string;

    /**
     *  The last name of the document owner.
     */
    readonly lastName: string;

    /**
     *  The localized name of the document owner.
     */
    readonly localizedName: string;

    /**
     *  The marital status of the document owner.
     */
    readonly maritalStatus: string;

    /**
     *  The data extracted from the machine readable zone.
     */
    readonly mrz: MrzResult;

    /**
     *  The nationality of the documet owner.
     */
    readonly nationality: string;

    /**
     *  The personal identification number.
     */
    readonly personalIdNumber: string;

    /**
     *  The place of birth of the document owner.
     */
    readonly placeOfBirth: string;

    /**
     * Status of the last recognition process.
     */
    readonly processingStatus: ProcessingStatus;

    /**
     *  The profession of the document owner.
     */
    readonly profession: string;

    /**
     *  The race of the document owner.
     */
    readonly race: string;

    /**
     * Recognition mode used to scan current document.
     */
    readonly recognitionMode: RecognitionMode;

    /**
     *  The religion of the document owner.
     */
    readonly religion: string;

    /**
     *  The residential status of the document owner.
     */
    readonly residentialStatus: string;

    /**
     *  The sex of the document owner.
     */
    readonly sex: string;

    /**
     * The image of the signature
     */
    readonly signatureImage: ImageResult;
}

/**
 * The result of image recognition when using the BlinkIdRecognizer.
 */
export interface BlinkIdRecognizerResult extends BaseBlinkIdRecognizerResult
{
    /**
     *  The full document image
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
export interface BlinkIdRecognizer extends Recognizer
{
    /** Returns the currently applied BlinkIdRecognizerSettings. */
    currentSettings(): Promise< BlinkIdRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: BlinkIdRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< BlinkIdRecognizerResult >;
}

/**
 * This function is used to create a new instance of `BlinkIdRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createBlinkIdRecognizer( wasmSDK: WasmSDK ): Promise< BlinkIdRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer( "BlinkIdRecognizer" ) as Promise< BlinkIdRecognizer >;
}
