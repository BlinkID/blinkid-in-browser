/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * RecognitionMode enum defines possible recognition modes for BlinkID Single-side and BlinkID Multi-side recognizers.
 */
export enum RecognitionMode
{
    /** No recognition performed. */
    None            = 0,

    /** Recognition of mrz document (does not include visa and passport) */
    MrzId           = 1,

    /** Recognition of visa mrz. */
    MrzVisa         = 2,

    /** Recognition of passport mrz. */
    MrzPassport     = 3,

    /** Recognition of documents that have face photo on the front. */
    PhotoId         = 4,

    /** Detailed document recognition. */
    FullRecognition = 5,

    /** Recognition of barcode document. */
    BarcodeId       = 6,

    /** Number of possible values */
    Count           = 7
}
