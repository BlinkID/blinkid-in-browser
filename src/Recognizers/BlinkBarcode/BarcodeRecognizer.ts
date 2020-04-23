import { Recognizer, RecognizerResult, RecognizerSettings, WasmSDK } from '../../MicroblinkSDK/DataStructures'
import { BarcodeData } from './BarcodeData'

/**
 * A settings object that is used for configuring the BarcodeRecognizer.
 */
export class BarcodeRecognizerSettings implements RecognizerSettings
{
    /**
     * Enables scanning of barcodes with inverse intensity values
     * (e.g. white barcode on black background).
     */
    shouldScanInverse  = false;

    /**
     * Enable slower, but more thorough scanning, thus giving the higher
     * possibility of successful scan.
     *
     * NOTE: this option has no effect on PDF417 barcode scanning
     */
    slowerThoroughScan = true;

    /**
     * Allow scanning PDF417 barcodes which don't have quiet zone
     * surrounding it (e.g. text concatenated with barcode). This
     * option can significantly increase recognition time.
     */
    nullQuietZoneAllowed     = false;

    /**
     * Enable decoding of non-standard PDF417 barcodes, but without
     * guarantee that all data will be read. This option should be enabled
     * for PDF417 barcode that has missing rows (i.e. not whole barcode is
     * printed)
     */
    uncertainDecodingAllowed = true;

    /**
     * Allow enabling the autodetection of image scale when scanning barcodes.
     * If set to true, prior reading barcode, image scale will be
     * corrected. This enabled correct reading of barcodes on high
     * resolution images but slows down the recognition process.
     *
     * NOTE: This setting is applied only for Code39 and Code128 barcode scanning.
     */
    useAutoScale = true;

    /**
     * Enable reading code39 barcode contents as extended data. For more information about code39
     * extended data (a.k.a. full ASCII mode), see https://en.wikipedia.org/wiki/Code_39#Full_ASCII_Code_39
     */
    readCode39AsExtendedData = false;

    /** Should Aztec 2D barcode be scanned. */
    scanAztec      = false;

    /** Should Code 128 1D barcode be scanned. */
    scanCode128    = false;

    /** Should Code 39 1D barcode be scanned. */
    scanCode39     = false;

    /** Should Data Matrix 2D barcode be scanned. */
    scanDataMatrix = false;

    /** Should EAN 13 1D barcode be scanned. */
    scanEAN13      = false;

    /** Should EAN 8 1D barcode be scanned. */
    scanEAN8       = false;

    /** Should ITF 1D barcode be scanned. */
    scanITF        = false;

    /** Should PDF417 2D barcode be scanned. */
    scanPDF417     = false;

    /** Should QR code be scanned. */
    scanQRCode     = false;

    /** Should UPC A 1D barcode be scanned. */
    scanUPCA       = false;

    /** Should UPC E 1D barcode be scanned. */
    scanUPCE       = false;
}

/**
 * The result of image recognition when using the BarcodeRecognizer.
 */
export interface BarcodeRecognizerResult extends RecognizerResult
{
    /** Result of barcode recognition */
    readonly barcodeData: BarcodeData;
}

/**
 * Recognizer that can perform recognition of any supported barcode type.
 */
export interface BarcodeRecognizer extends Recognizer
{
    /** Returns the currently applied BarcodeRecognizerSettings. */
    currentSettings(): Promise< BarcodeRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: BarcodeRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< BarcodeRecognizerResult >;
}

/**
 * This function is used to create a new instance of `BarcodeRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createBarcodeRecognizer( wasmSDK: WasmSDK ): Promise< BarcodeRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer( "BarcodeRecognizer" ) as Promise< BarcodeRecognizer >;
}
