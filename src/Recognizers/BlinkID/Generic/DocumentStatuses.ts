/**
 * DocumentImageColorStatus enum defines possible color statuses determined from scanned image.
 */
export enum DocumentImageColorStatus
{
    /** Determining image color status was not performed */
    NotAvailable = 0,

    /** Black-and-white image scanned */
    BlackAndWhite,

    /** Color image scanned */
    Color
}

/**
 *  DocumentImageMoireStatus enum defines possible states of Moire pattern detection.
 */
export enum DocumentImageMoireStatus
{
    /** Detection of Moire patterns was not performed */
    NotAvailable = 0,

    /** Moire pattern not detected on input image */
    NotDetected,

    /** Moire pattern detected on input image */
    Detected
}
