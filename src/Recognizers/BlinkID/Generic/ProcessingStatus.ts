/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/** Detailed information about the recognition process. */
export enum ProcessingStatus
{
    /** The document was fully scanned and data was extracted as expected. */
    Success = 0,

    /** The document was not found on the image. */
    DetectionFailed,

    /** Preprocessing of the input image has failed. */
    ImagePreprocessingFailed,

    /**
     * Stability is achieved when the same document is provided on consecutive frames,
     * resulting in a consistent recognition between frames prior to data extraction.
     * Valid only for video feed.
     */
    StabilityTestFailed,

    /**
     * The wrong side of the document is scanned. Front side scan is completed and back side is expected, but not
     * provided by the end-user.
     *
     * Possible also if front is expected at the start of the scanning process and back is presented first
     * by the end-user.
     */
    ScanningWrongSide,

    /** Unexpected fields are present on the document and removed from the final result. */
    FieldIdentificationFailed,

    /** Fields expected to appear on the scanned document have not been found. */
    MandatoryFieldMissing,

    /**
     * One of the extracted fields contains a character which does not satisfy the rule defined for that
     * specific field.
     *
     * This processing status can only occur if validateResultCharacters setting is set to true.
     */
    InvalidCharactersFound,

    /** Failed to return a requested image. */
    ImageReturnFailed,

    /** Reading or parsing of the barcode has failed. */
    BarcodeRecognitionFailed,

    /** Parsing of the MRZ has failed. */
    MrzParsingFailed,

    /**
     * Currently scanned document has been filtered out by its class.
     * Occurrence of this processing status is affected by classFilter setting.
     */
    ClassFiltered,

    /** Document currently not supported by the recognizer. */
    UnsupportedClass,

    /** Document class is not included in the issued license. */
    UnsupportedByLicense,

    /**
     * Front side recognition has completed successfully, and recognizer is waiting for the other side to be scanned.
     */
    AwaitingOtherSide,

    /** If front side recognition has not completed successfully, the back side is not scanned. */
    NotScanned,

    /** Number of possible processing statuses. */
    Count
}
