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
        } satisfies ImageData;

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
export function captureFrame( imageSource: CanvasImageSource, shouldCrop = false ): CapturedFrame
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


    ctx = ctx || canvas.getContext( "2d", { willReadFrequently: true,
        alpha: false } );

    if ( !ctx )
    {
        throw new SDKError( ErrorTypes.frameCaptureErrors.canvasMissing );
    }

    ctx.drawImage( imageSource, 0, 0, canvas.width, canvas.height );

    /**
     * Take full image or cropped image based on focus problems.
     *
     * iPhone 14 Pro has focus problems, i.e. user should place a document somehow
     * far away from the camera to get the proper focus.
     *
     * In that case we're getting much bigger images (4K), and we're cropping the center
     * of the image which is then sent to processing - rectangle that is 66% size of the
     * original image is cropped from the image center.
     */
    const cropFactor = shouldCrop ? 0.66 : 1;
    const targetWidth = canvas.width * cropFactor;
    const targetHeight = canvas.height * cropFactor;
    const targetX = ( canvas.width - targetWidth ) / 2;
    const targetY = ( canvas.height - targetHeight ) / 2;
    const pixelData = ctx.getImageData( targetX, targetY, targetWidth, targetHeight );

    return new CapturedFrame(
        pixelData,
        // TODO: https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation
        // or https://developer.mozilla.org/en-US/docs/Web/API/Window/orientation
        ImageOrientation.NoRotation,
        videoFrame
    );
}
