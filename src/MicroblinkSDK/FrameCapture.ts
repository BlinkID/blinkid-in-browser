/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { ImageOrientation } from "./DataStructures";

// ============================================ /
// Frame capture and camera management support. /
// ============================================ /

let canvas : HTMLCanvasElement;

/**
 * Represents a captured frame from HTMLVideoElement.
 */
export class CapturedFrame
{
    /** Instance of ImageData object - contains pixels and metadata about the captured image. */
    readonly imageData: ImageData;

    /** Orientation of the captured frame */
    readonly orientation: ImageOrientation;

    /** Indicates whether captured frame originated from still image or video stream. */
    readonly videoFrame: boolean;

    constructor( imageData: ImageData, orientation: ImageOrientation, videoFrame: boolean )
    {
        this.imageData = imageData;
        this.orientation = orientation;
        this.videoFrame = videoFrame;
    }
}

/**
 * Captures a frame from any CanvasImageSource, such as HTMLVideoElement or HTMLImageElement.
 * @param imageSource image source from which frame should be captured
 * @returns instance of CapturedFrame
 */
export function captureFrame( imageSource: CanvasImageSource ): CapturedFrame
{
    let imageWidth: number;
    let imageHeight: number;
    let videoFrame = false;
    if ( imageSource instanceof HTMLVideoElement )
    {
        imageWidth = imageSource.videoWidth;
        imageHeight = imageSource.videoHeight;
        videoFrame = true;
    }
    else if ( imageSource instanceof HTMLImageElement )
    {
        imageWidth = imageSource.naturalWidth;
        imageHeight = imageSource.naturalHeight;
    }
    else if ( imageSource instanceof SVGImageElement )
    {
        throw new Error( "Recognition of SVG elements not supported!" );
    }
    else
    {
        imageWidth = imageSource.width;
        imageHeight = imageSource.height;
    }

    canvas = canvas || document.createElement( "canvas" );
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    const ctx = canvas.getContext( "2d" );

    if ( !ctx )
    {
        throw new Error( "Could not get canvas 2d context!" );
    }

    ctx.drawImage( imageSource, 0, 0, canvas.width, canvas.height );
    const pixelData = ctx.getImageData( 0, 0, canvas.width, canvas.height );

    return new CapturedFrame
    (
        pixelData,
        // TODO: https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation
        // or https://developer.mozilla.org/en-US/docs/Web/API/Window/orientation
        ImageOrientation.NoRotation,
        videoFrame
    );
}
