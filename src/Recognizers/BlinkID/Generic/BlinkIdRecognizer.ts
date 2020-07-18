import { ClassInfo } from "./ClassInfo";
import { DocumentImageColorStatus, DocumentImageMoireStatus } from "./DocumentStatuses";
import { DriverLicenseDetailedInfo } from "./DriverLicenseDetailedInfo";

import
{
    FullDocumentImageOptions,
    FaceImageOptions,
    validateDpi,
    ExtensionFactors,
    ImageResult
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

// required for final SDK
export * from "./ClassInfo";
export * from "./DriverLicenseDetailedInfo";
export * from "./DocumentStatuses";

/**
 * A settings object that is used for configuring the BlinkIdRecognizer.
 */
export class BlinkIdRecognizerSettings implements RecognizerSettings, FullDocumentImageOptions, FaceImageOptions
{
    /**
     *  Defines whether blured frames filtering is allowed"
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
     * Whether result characters validatation is performed.
     * If a result member contains invalid character, the result state cannot be valid.
     */
    validateResultCharacters = true;

    /**
     * Whether sensitive data should be anonymized in full document image result.
     * The setting only applies to certain documents.
     */
    anonymizeImage = true;

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
}

/**
 * The result of image recognition when using the BlinkIdRecognizer.
 */
export interface BlinkIdRecognizerResult extends RecognizerResult
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
     *  The address of the document owner.
     */
    readonly address: string;

    /**
     *  The class info
     */
    readonly classInfo: ClassInfo;

    /**
     *  The conditions
     */
    readonly conditions: string;

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
     * Indicates whether scanned image was colored or not.
     * Available only if allowed by the given license key.
     */
    readonly documentImageColorStatus: DocumentImageColorStatus;

    /**
     * Indicates whether Moire pattern was detected on the document.
     * Available only if allowed by the given license key.
     */
    readonly documentImageMoireStatus: DocumentImageMoireStatus;

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
     *  The full document image
     */
    readonly fullDocumentImage: ImageResult;

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
     *  The profession of the document owner.
     */
    readonly profession: string;

    /**
     *  The race of the document owner.
     */
    readonly race: string;

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
