/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

export interface ImageAnalysisResult
{
    /**
     * Whether the image is blurred.
     */
    readonly blurred: boolean;

    /**
     * The color status determined from scanned image.
     */
    readonly documentImageColorStatus: DocumentImageColorStatus;

    /**
     * The Moire pattern detection status determined from the scanned image.
     */
    readonly documentImageMoireStatus: ImageAnalysisDetectionStatus;

    /**
     * Face detection status determined from the scanned image.
     */
    readonly faceDetectionStatus: ImageAnalysisDetectionStatus;

    /**
     * Mrz detection status determined from the scanned image.
     */
    readonly mrzDetectionStatus: ImageAnalysisDetectionStatus;

    /**
     * Barcode detection status determined from the scanned image.
     */
    readonly barcodeDetectionStatus: ImageAnalysisDetectionStatus;
}

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
 *  ImageAnalysisDetectionStatus enum defines possible states of specific image object detection.
 */
export enum ImageAnalysisDetectionStatus
{
    /** Detection was not performed */
    NotAvailable = 0,

    /** Object not detected on input image */
    NotDetected,

    /** Object detected on input image */
    Detected
}
