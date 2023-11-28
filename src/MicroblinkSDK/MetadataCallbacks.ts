/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { Point, Quadrilateral } from "./Geometry";

/**
 * Interface representing possible events that can occur during image processing.
 * All functions in this interface are optional and will be called only if they are
 * implemented.
 */
export interface MetadataCallbacks
{
    /**
     * Called when recognition process wants to display some debug text information.
     * @param debugTest Debug text information to be displayed.
     */
    onDebugText?( debugTest: string ): void

    /**
     * Called when all recognizers in RecognizerRunner have failed to detect anything on the image.
     */
    onDetectionFailed?(): void

    /**
     * Called when recognition process wants to display some quadrilateral.
     * @param quad Quadrilateral to be displayed.
     */
    onQuadDetection?( quad: DisplayableQuad ): void

    /**
     * Called when recognition process wants to display some points.
     * @param pointSet Points to be displayed.
     */
    onPointsDetection?( pointSet: DisplayablePoints ): void

    /**
     * Called when first side recognition with the multi-side recognizer completes.
     */
    onFirstSideResult?(): void

    /**
     * Called when glare detection has completed with result whether glare has been found or not.
     * @param hasGlare indicates whether glare has been found on the input image or not
     */
    onGlare?( hasGlare: boolean ): void;
}

/**
 * Detection status of the specific detected object.
 */
export enum DetectionStatus
{
    /** Detection has failed. */
    Failed,
    /** Document has been detected. */
    Success,
    /** Document has been detected but the camera is too far from the document. */
    CameraTooFar,
    /** Document has been detected but the camera is too close to the document. */
    CameraTooClose,
    /** Document has been detected but the camera’s angle is too steep. */
    CameraAngleTooSteep,
    /** Document has been detected but the document is too close to the camera edge. */
    DocumentTooCloseToCameraEdge,
    /** Only part of the document is visible. */
    DocumentPartiallyVisible,
    /** Fallback detection was successful (PhotoPay specific). */
    FallbackSuccess
}

/**
 * Interface representing any displayable object.
 */
export interface Displayable
{
    /** Detection status of the displayable object. */
    detectionStatus: DetectionStatus

    /**
     * 3x3 transformation matrix from the image's coordinate system to view's coordinate system.
     */
    transformMatrix: Float32Array
}

/**
 * Interface representing quadrilateral in image.
 */
export interface DisplayableQuad extends Displayable, Quadrilateral
{}

/**
 * Interface representing list of points in image.
 */
export interface DisplayablePoints extends Displayable
{
    /** Array of points */
    points: Point[]
}
