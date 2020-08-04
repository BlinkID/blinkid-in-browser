/** Detailed information about the recognition process. */
export enum ProcessingStatus
{
    /** Recognition was successful. */
    Success = 0,

    /** Detection of the document failed. */
    DetectionFailed,

    /** Preprocessing of the input image has failed. */
    ImagePreprocessingFailed,

    /** Recognizer has inconsistent results. */
    StabilityTestFailed,

    /** Wrong side of the document has been scanned. */
    ScanningWrongSide,

    /** Identification of the fields present on the document has failed. */
    FieldIdentificationFailed,

    /** Mandatory field for the specific document is missing. */
    MandatoryFieldMissing,

    /** Result contains invalid characters in some of the fields. */
    InvalidCharactersFound,

    /** Failed to return a requested image. */
    ImageReturnFailed,

    /** Reading or parsing of the barcode has failed. */
    BarcodeRecognitionFailed,

    /** Parsing of the MRZ has failed. */
    MrzParsingFailed,

    /** Document class has been filtered out. */
    ClassFiltered,

    /** Document currently not supported by the recognizer. */
    UnsupportedClass,

    /** License for the detected document is missing. */
    UnsupportedByLicense
}
