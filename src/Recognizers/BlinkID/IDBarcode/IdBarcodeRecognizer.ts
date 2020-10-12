import
{
    Recognizer,
    RecognizerResult,
    RecognizerSettings,
    MBDate,
    WasmSDK
} from "../../../MicroblinkSDK/DataStructures";

import { BarcodeData } from "../../BlinkBarcode/BarcodeData";

/**
 * A settings object that is used for configuring the IdBarcodeRecognizer.
 */
export class IdBarcodeRecognizerSettings implements RecognizerSettings
{

}

/**
 * The result of image recognition when using the IdBarcodeRecognizer.
 */
export interface IdBarcodeRecognizerResult extends RecognizerResult
{
    /**
     *  The additional name information of the document owner.
     */
    readonly additionalNameInformation: string;

    /**
     *  The address of the document owner.
     */
    readonly address: string;

    /**
     *  The raw, unparsed barcode data.
     */
    readonly barcodeData: BarcodeData;

    /**
     * The city address portion of the document owner.
     */
    readonly city: string;

    /**
     *  The date of birth of the document owner.
     */
    readonly dateOfBirth: MBDate;

    /**
     *  The date of expiry of the document.
     */
    readonly dateOfExpiry: MBDate;

    /**
     *  The date of issue of the document.
     */
    readonly dateOfIssue: MBDate;

    /**
     *  The additional number of the document.
     */
    readonly documentAdditionalNumber: string;

    /**
     *  The document number.
     */
    readonly documentNumber: string;

    /**
     *  The document type deduced from the recognized barcode
     */
    readonly documentType: IdBarcodeDocumentType;

    /**
     *  The employer of the document owner.
     */
    readonly employer: string;

    /**
     * The additional privileges granted to the driver license owner.
     */
    readonly endorsements: string;

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
     * The jurisdiction code address portion of the document owner.
     */
    readonly jurisdiction: string;

    /**
     *  The last name of the document owner.
     */
    readonly lastName: string;

    /**
     *  The marital status of the document owner.
     */
    readonly maritalStatus: string;

    /**
     * The middle name of the document owner.
     */
    readonly middleName: string;

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
     * The postal code address portion of the document owner.
     */
    readonly postalCode: string;

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
     *  The residential stauts of the document owner.
     */
    readonly residentialStatus: string;

    /**
     * The restrictions to driving privileges for the driver license owner.
     */
    readonly restrictions: string;

    /**
     *  The sex of the document owner.
     */
    readonly sex: string;

    /**
     * The street address portion of the document owner.
     */
    readonly street: string;

    /**
     * The type of vehicle the driver license owner has privilege to drive.
     */
    readonly vehicleClass: string;
}

/**
 * The ID Barcode Recognizer is used for scanning barcodes on ID documents.
 */
export interface IdBarcodeRecognizer extends Recognizer
{
    /** Returns the currently applied IdBarcodeRecognizerSettings. */
    currentSettings(): Promise< IdBarcodeRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: IdBarcodeRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< IdBarcodeRecognizerResult >;
}

/**
 * This function is used to create a new instance of `IdBarcodeRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createIdBarcodeRecognizer( wasmSDK: WasmSDK ): Promise< IdBarcodeRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer( "IdBarcodeRecognizer" ) as Promise< IdBarcodeRecognizer >;
}

/**
 * Represents the type of scanned document
 */
export enum IdBarcodeDocumentType
{
    /**
     * No document was scanned
     */
    None = 0,

    /**
     * AAMVACompliant document was scanned
     */
    AAMVACompliant,

    /**
     * ArgentinaID document was scanned
     */
    ArgentinaID,

    /**
     * ArgentinaDL document was scanned
     */
    ArgentinaDL,

    /**
     * ColombiaID document was scanned
     */
    ColombiaID,

    /**
     * ColombiaDL document was scanned
     */
    ColombiaDL,

    /**
     * NigeriaVoterID document was scanned
     */
    NigeriaVoterID,

    /**
     * NigeriaDL document was scanned
     */
    NigeriaDL,

    /**
     * PanamaID document was scanned
     */
    PanamaID,

    /**
     * SouthAfricaID document was scanned
     */
    SouthAfricaID
}
