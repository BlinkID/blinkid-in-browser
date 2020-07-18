import { BlinkIdRecognizerSettings } from "./BlinkIdRecognizer";
import { ClassInfo } from "./ClassInfo";
import { CombinedRecognizerResult } from "../CombinedRecognizer";
import { DocumentImageColorStatus, DocumentImageMoireStatus } from "./DocumentStatuses";
import { DriverLicenseDetailedInfo } from "./DriverLicenseDetailedInfo";
import { ImageResult } from "../ImageOptions";
import { MrzResult } from "../MRTD/MrtdStructures";

import
{
    Recognizer,
    DigitalSignatureOptions,
    MBDate,
    DigitalSignature,
    WasmSDK
} from "../../../MicroblinkSDK/DataStructures";

/**
 * A settings object that is used for configuring the BlinkIdCombinedRecognizer.
 */
export class BlinkIdCombinedRecognizerSettings extends BlinkIdRecognizerSettings implements DigitalSignatureOptions
{
    // implementation od the DigitalSignatureOptions interface
    allowSignature = false;
}

/**
 * The result of image recognition when using the BlinkIdCombinedRecognizer.
 */
export interface BlinkIdCombinedRecognizerResult extends CombinedRecognizerResult
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
     *  The digital signature
     */
    readonly digitalSignature: DigitalSignature;

    /**
     *  The additional number of the document.
     */
    readonly documentAdditionalNumber: string;

    /**
     * Indicates whether scanned image of the front side was colored or not.
     * Available only if allowed by the given license key.
     */
    readonly documentFrontImageColorStatus: DocumentImageColorStatus;

    /**
     * Indicates whether scanned image of the back side was colored or not.
     * Available only if allowed by the given license key.
     */
    readonly documentBackImageColorStatus: DocumentImageColorStatus;

    /**
     * Indicates whether Moire pattern was detected on the front side of the document.
     * Available only if allowed by the given license key.
     */
    readonly documentFrontImageMoireStatus: DocumentImageMoireStatus;

    /**
     * Indicates whether Moire pattern was detected on the back side of the document.
     * Available only if allowed by the given license key.
     */
    readonly documentBackImageMoireStatus: DocumentImageMoireStatus;

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
     *  The full document back image
     */
    readonly fullDocumentBackImage: ImageResult;

    /**
     *  The full document front image
     */
    readonly fullDocumentFrontImage: ImageResult;

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
