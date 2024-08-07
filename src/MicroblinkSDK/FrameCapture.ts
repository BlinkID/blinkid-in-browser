/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { SDKError } from "./SDKError";
import { ImageOrientation } from "./DataStructures";
import * as ErrorTypes from "./ErrorTypes";

// ============================================ /
// Frame capture and camera management support. /
// ============================================ /

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;


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
        // workaround for memory leak: https://github.com/ivancuric/memory-leak-repro
        const fakeImageData = {
            data: imageData.data,
            width: imageData.width,
            height: imageData.height,
            colorSpace: imageData.colorSpace,
        } as ImageData;

        this.imageData = fakeImageData;
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
        throw new SDKError( ErrorTypes.frameCaptureErrors.svgUnsupported );
    }
    else if ( imageSource instanceof VideoFrame )
    {
        // eslint is being stupid here, it's a VideoFrame object
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        imageWidth = imageSource.displayWidth;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        imageHeight = imageSource.displayHeight;
    }
    else
    {
        imageWidth = imageSource.width;
        imageHeight = imageSource.height;
    }

    canvas = canvas || document.createElement( "canvas" );

    if ( canvas.width !== imageWidth && canvas.height !== imageHeight )
    {
        canvas.width = imageWidth;
        canvas.height = imageHeight;
    }


    ctx = ctx || canvas.getContext( "2d", { willReadFrequently: true } );

    if ( !ctx )
    {
        throw new SDKError( ErrorTypes.frameCaptureErrors.canvasMissing );
    }

    ctx.drawImage( imageSource, 0, 0, canvas.width, canvas.height );

    const pixelData = ctx.getImageData( 0, 0, canvas.width, canvas.height );

    return new CapturedFrame(
        pixelData,
        // TODO: https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation
        // or https://developer.mozilla.org/en-US/docs/Web/API/Window/orientation
        ImageOrientation.NoRotation,
        videoFrame
    );
}
