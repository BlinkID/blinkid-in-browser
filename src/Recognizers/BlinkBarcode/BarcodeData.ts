/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * Possible formats of barcodes that can be detected. This enum will be returned
 * as part of BarcodeRecognizerResult interface.
 */
export enum BarcodeFormat
{
    /** Indicates that no barcode has been detected. */
    NONE = 0,
    /** Indicates that QR code has been detected. */
    QR_CODE,
    /** Indicates that Data Matrix 2D barcode has been detected. */
    DATA_MATRIX,
    /** Indicates that UPC E 1D barcode has been detected. */
    UPC_E,
    /** Indicates that UPC A 1D barcode has been detected. */
    UPC_A,
    /** Indicates that EAN 8 1D barcode has been detected. */
    EAN_8,
    /** Indicates that EAN 13 1D barcode has been detected. */
    EAN_13,
    /** Indicates that Code 128 1D barcode has been detected. */
    CODE_128,
    /** Indicates that Code 39 1D barcode has been detected. */
    CODE_39,
    /** Indicates that ITF 1D barcode has been detected. */
    ITF,
    /** Indicates that Aztec 2D barcode has been detected. */
    AZTEC_BARCODE,
    /** Indicates that PDF417 2D barcode has been detected. */
    PDF417_BARCODE
}

/**
 * Data extracted from barcode.
 */
export interface BarcodeData
{
    /** Format of recognized barcode. */
    readonly barcodeFormat: BarcodeFormat;

    /**
     * True if returned result is uncertain, i.e. if scanned barcode was incomplete (i.e.
     * (has parts of it missing).
     */
    readonly uncertain: boolean;

    /** String representation of data inside barcode. */
    readonly stringData: string;

    /** The raw bytes contained inside barcode. */
    readonly rawBytes: Uint8Array;
}
