import
{
    FullDocumentImageOptions,
    validateDpi,
    ExtensionFactors,
    ImageResult
} from "../ImageOptions";

import { MrzResult } from "./MrtdStructures";

import
{
    Recognizer,
    RecognizerResult,
    RecognizerSettings,
    WasmSDK
} from "../../../MicroblinkSDK/DataStructures";


/**
 * A settings object that is used for configuring the MrtdRecognizer.
 */
export class MrtdRecognizerSettings implements RecognizerSettings, FullDocumentImageOptions
{
    /**
     * Defines whether returning of unparsed results is allowed.
     */
    allowUnparsedResults = false;

    /**
     * Defines whether returning unverified results is allowed.
     * Unverified MRZ is parsed, but check digits are incorrect.
     */
    allowUnverifiedResults = true;

    /**
     * Whether special characters are allowed.
     */
    allowSpecialCharacters = false;

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
}

/**
 * The result of image recognition when using the MrtdRecognizer.
 */
export interface MrtdRecognizerResult extends RecognizerResult
{
    /**
     *  The full document image
     */
    readonly fullDocumentImage: ImageResult;

    /**
     *  The data extracted from the machine readable zone.
     */
    readonly mrzResult: MrzResult;
}

/**
 * The Blink ID Recognizer is used for scanning any ID document.
 */
export interface MrtdRecognizer extends Recognizer
{
    /** Returns the currently applied MrtdRecognizerSettings. */
    currentSettings(): Promise< MrtdRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: MrtdRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< MrtdRecognizerResult >;
}

/**
 * This function is used to create a new instance of `MrtdRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createMrtdRecognizer( wasmSDK: WasmSDK ): Promise< MrtdRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer( "MrtdRecognizer" ) as Promise< MrtdRecognizer >;
}
