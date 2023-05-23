/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import {
    bindCameraToVideoFeed,
    isCameraFocusProblematic,
    PreferredCameraType,
    selectCamera,
    SelectedCamera,
} from "./CameraUtils";

import pThrottle from "p-throttle";

import { RecognizerResultState, RecognizerRunner } from "./DataStructures";

import { ErrorMessages, videoRecognizerErrors } from "./ErrorTypes";

import { captureFrame } from "./FrameCapture";
import { SDKError } from "./SDKError";

const TARGET_FPS = 15;

const throttle = pThrottle( {
    limit: 1,
    interval: Math.round( 1 / TARGET_FPS * 1000 ),
    strict: true
} );

/**
 * Indicates mode of recognition in `VideoRecognizer`.
 */
export enum VideoRecognitionMode {
    /** Normal recognition */
    Recognition,
    /** Indefinite scan. Useful for profiling the performance of scan (using `onDebugText` metadata callback) */
    RecognitionTest,
    /** Only detection. Useful for profiling the performance of detection (using `onDebugText` metadata callback) */
    DetectionTest,
}

/**
 * Invoked when VideoRecognizer finishes the recognition of the video stream.
 * @param {RecognizerResultState} recognitionState  The state of recognition
 * after finishing. If `Empty` or `Uncertain` are returned, this indicates that
 * the scanning was cancelled or timeout has been reached.
 */
export type OnScanningDone = ( recognitionState: RecognizerResultState ) => void;

/**
 * A wrapper around `RecognizerRunner` that can use it to perform recognition of
 * video feeds - either from live camera or from predefined video file.
 */
export class VideoRecognizer
{
    private videoElement: HTMLVideoElement;

    private recognizerRunner: RecognizerRunner;

    deviceId: string | null = null;

    private recognitionCancelRequested = false;

    private recognitionPauseRequested = false;

    private recognitionTimeoutMs = 20000;

    private timeoutStartedAt = 0;

    private currentTimeoutCount = 0;

    private videoRecognitionMode: VideoRecognitionMode = VideoRecognitionMode.Recognition;

    private onScanningDone: OnScanningDone | null = null;

    private cameraFlipped = false;

    private isProblematicFocus = false;

    declare private frameCallback: HTMLVideoElement["requestVideoFrameCallback"] | typeof requestAnimationFrame;

    /**
     * **Use only if provided factory functions are not well-suited for your use
     * case.**
     *
     * Creates a new `VideoRecognizer` with provided `HTMLVideoElement`.
     *
     * Keep in mind that `HTMLVideoElement` **must have** a video feed which is
     * ready to use.
     *
     * - If you want to take advantage of provided camera management, use
     *   `createVideoRecognizerFromCameraStream`
     * - In case that static video file should be processed, use
     *   `createVideoRecognizerFromVideoPath`
     *
     * @param videoElement HTMLVideoElement with video feed which is going to be
     * processed
     * @param recognizerRunner RecognizerRunner that should be used for video
     * stream recognition
     * @param cameraFlipped Whether the camera is flipped, e.g. if front-facing
     * camera is used
     * @param deviceId
     */
    constructor(
        videoElement: HTMLVideoElement,
        recognizerRunner: RecognizerRunner,
        cameraFlipped = false,
        deviceId: string | null = null
    )
    {
        this.videoElement = videoElement;
        this.recognizerRunner = recognizerRunner;
        this.cameraFlipped = cameraFlipped;
        this.deviceId = deviceId;
        this.isProblematicFocus = isCameraFocusProblematic();

        if ( "requestVideoFrameCallback" in HTMLVideoElement.prototype )
        {
            this.frameCallback = this.videoElement.requestVideoFrameCallback.bind( this.videoElement );
        }
        else
        {
            this.frameCallback = window.requestAnimationFrame.bind( window );
        }

        void this.handleFlippingVideo();

        // Prepare the `video` element so that it can autoplay on iOS
        // https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/
        // https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide#autoplay_availability

        this.videoElement.setAttribute( "playsinline", "" );
        this.videoElement.setAttribute( "mute", "" );
    }

    private handleFlippingVideo = async () =>
    {
        let scaleX = 1;
        let scaleY = 1;


        if ( this.isProblematicFocus )
        {
            scaleY = 1.5;
            scaleX = 1.5;
        }
        else
        {
            scaleY = 1;
            scaleX = 1;
        }

        if ( this.cameraFlipped )
        {
            scaleX = -scaleX;
        }


        this.videoElement.style.transform = `scale(${scaleX}, ${scaleY})`;

        // evaluate negative scale as true, positive as false
        await this.recognizerRunner.setCameraPreviewMirrored( scaleX < 0 );
    };

    /**
     * Creates a new VideoRecognizer by opening a camera stream and attaching it
     * to given `HTMLVideoElement`. If camera cannot be accessed, the returned
     * promise will be rejected.
     *
     * @param cameraFeed `HTMLVideoElement` to which camera stream should be
     * attached
     * @param recognizerRunner `RecognizerRunner` that should be used for video
     * stream recognition
     * @param cameraId User can provide specific camera ID to be selected and used
     * @param preferredCameraType Whether back facing or front facing camera is
     *        preferred. Obeyed only if there is a choice (i.e. if device has only
     *        front-facing camera, the opened camera will be a front-facing
     *        camera, regardless of preference)
     */
    static async createVideoRecognizerFromCameraStream(
        cameraFeed: HTMLVideoElement,
        recognizerRunner: RecognizerRunner,
        cameraId: string | null = null,
        preferredCameraType: PreferredCameraType = PreferredCameraType.BackFacingCamera
    )
    {
        if ( !cameraFeed || !( cameraFeed instanceof HTMLVideoElement ) )
        {
            throw new SDKError( videoRecognizerErrors.elementMissing );
        }

        if ( !navigator.mediaDevices.getUserMedia )
        {
            throw new SDKError( videoRecognizerErrors.mediaDevicesUnsupported );
        }

        const selectedCamera = await selectCamera( cameraId, preferredCameraType );

        if ( !selectedCamera )
        {
            throw new SDKError( videoRecognizerErrors.cameraMissing );
        }

        const shouldMaxResolution = isCameraFocusProblematic();

        const cameraFlipped = await bindCameraToVideoFeed(
            selectedCamera,
            cameraFeed,
            preferredCameraType,
            shouldMaxResolution
        );

        return new VideoRecognizer( cameraFeed, recognizerRunner, cameraFlipped, selectedCamera.deviceId );
    }

    /**
     * Creates a new `VideoRecognizer` by attaching the given URL to video to
     * given `HTMLVideoElement` and using it to display video frames while
     * processing them.
     *
     * @param videoPath URL of the video file that should be recognized.
     * @param videoElement `HTMLVideoElement` to which video file will be attached
     * @param recognizerRunner `RecognizerRunner` that should be used for video
     * stream recognition.
     */
    static createVideoRecognizerFromVideoPath(
        videoPath: string,
        videoElement: HTMLVideoElement,
        recognizerRunner: RecognizerRunner
    )
    {
        const videoRecognizer = new VideoRecognizer( videoElement, recognizerRunner );

        videoElement.src = videoPath;
        videoElement.currentTime = 0;

        videoElement.onended = () =>
        {
            videoRecognizer.cancelRecognition();
        };
        return videoRecognizer;
    }

    flipCamera = async () =>
    {
        this.cameraFlipped = !this.cameraFlipped;

        await this.handleFlippingVideo();
    };

    isCameraFlipped = () =>
    {
        return this.cameraFlipped;
    };

    /**
     * Sets the video recognition mode to be used.
     */
    setVideoRecognitionMode = async ( videoRecognitionMode: VideoRecognitionMode ) =>
    {
        this.videoRecognitionMode = videoRecognitionMode;
        const isDetectionMode = this.videoRecognitionMode === VideoRecognitionMode.DetectionTest;
        await this.recognizerRunner.setDetectionOnlyMode( isDetectionMode );
    };

    /**
     * Starts the recognition of the video stream associated with this
     * `VideoRecognizer`. The stream will be unpaused and recognition loop will
     * start. After recognition completes, an `onScanningDone` callback will be
     * invoked with state of the recognition.
     *
     * NOTE: As soon as the execution of the callback completes, the recognition
     *       loop will continue and recognition state will be retained. To clear
     *       the recognition state, use {@linkcode resetRecognizers} (within your
     *       callback). To pause the recognition loop, use
     *       {@linkcode pauseRecognition} (within your callback) - to resume it
     *       later use {@linkcode resumeRecognition}. To completely stop the
     *       recognition and video feed, while keeping the ability to use this
     *       `VideoRecognizer` later, use {@linkcode pauseVideoFeed}. To
     *       completely stop the recognition and video feed and release all the
     *       resources involved with the video stream, use
     *       {@linkcode releaseVideoFeed}.
     *
     * @param onScanningDone Callback that will be invoked when recognition
     * completes.
     * @param recognitionTimeoutMs Amount of time in ms that the recognizer will
     * stay in the `Uncertain` state before resolving.
     */
    startRecognition = async ( onScanningDone: OnScanningDone, recognitionTimeoutMs = 20000 ) =>
    {
        try
        {
            await this.videoElement.play();
        }
        catch ( error )
        {
            throw new Error( ErrorMessages.VIDEO_RECOGNIZER_PLAY_REQUEST_INTERRUPTED );
        }

        // Following 2 lines might not be needed. Just in case left here.
        this.recognitionPauseRequested = false;
        this.recognitionCancelRequested = false;

        this.clearTimeout();
        this.recognitionTimeoutMs = recognitionTimeoutMs;
        this.onScanningDone = onScanningDone;

        await this.throttledQueueFrame();
    };

    /**
     * Resumes the recognition and video playback
     * @param resetRecognizers Indicates whether resetRecognizers should be
     * invoked while resuming the recognition
     */
    resumeRecognition = async ( resetRecognizers: boolean ) =>
    {
        if ( resetRecognizers )
        {
            try
            {
                await this.resetRecognizers( true );
            }
            catch ( error )
            {
                throw new SDKError( videoRecognizerErrors.recognizersResetFailure );
            }
        }

        try
        {
            await this.videoElement.play();
        }
        catch ( error )
        {
            throw new Error( ErrorMessages.VIDEO_RECOGNIZER_PLAY_REQUEST_INTERRUPTED );
        }

        try
        {
            this.recognitionPauseRequested = false;
            await this.throttledQueueFrame();
        }
        catch ( error )
        {
            this.recognitionPauseRequested = true;
            console.error( error );
        }
    };

    /**
     * Performs the recognition of the video stream associated with this
     * `VideoRecognizer`. The stream will be unpaused, recognition will be
     * performed and promise will be resolved with recognition status. After the
     * resolution of returned promise, the video stream will be paused, but not
     * released. To release the stream, use function `releaseVideoFeed`.
     *
     * This is a simple version of {@linkcode startRecognition} that should be
     * used for most cases, like when you only need to perform one scan per video
     * session.
     *
     * @param recognitionTimeoutMs Amount of time in ms that the recognizer will
     * stay in the `Uncertain` state before resolving.
     */
    recognize = ( recognitionTimeoutMs = 20000 ) =>
    {
        return new Promise<RecognizerResultState>( ( resolve ) =>
        {
            const onScanningDone: OnScanningDone = ( recognitionState ) =>
            {
                this.pauseVideoFeed();
                resolve( recognitionState );
            };

            void this.startRecognition( onScanningDone, recognitionTimeoutMs );
        } );
    };

    /**
     * Pauses the video feed. You can resume the feed by calling recognize or
     * `startRecognition`. Note that this pauses both the camera feed and
     * recognition. If you just want to pause recognition, while keeping the
     * camera feed active, call method `pauseRecognition`.
     */
    pauseVideoFeed = () =>
    {
        // fix for https://developer.chrome.com/blog/play-request-was-interrupted/
        if ( this.videoElement.readyState > this.videoElement.HAVE_CURRENT_DATA && !this.videoElement.paused )
        {
            this.videoElement.pause();
            this.pauseRecognition();
        }
    };

    /**
     * Pauses the recognition. This means that video frames that arrive from given
     * video source will not be recognized. To resume recognition, call
     * {@linkcode resumeRecognition}.
     */
    pauseRecognition = () =>
    {
        this.recognitionPauseRequested = true;
    };

    /**
     * Cancels current ongoing recognition. Unlike {@linkcode pauseRecognition} this will reset everything
     */
    cancelRecognition = () =>
    {
        this.recognitionCancelRequested = true;
    };

    /**
     * Convenience method for invoking
     * {@linkcode RecognizerRunner.resetRecognizers} on associated
     * `RecognizerRunner`.
     */
    resetRecognizers = async ( hardReset: boolean ) =>
    {
        await this.recognizerRunner.resetRecognizers( hardReset );
    };

    /**
     * Convenience method for accessing `RecognizerRunner` associated with this
     * `VideoRecognizer`. Sometimes it's useful to reconfigure `RecognizerRunner`
     * while handling `onScanningDone` callback and this method makes that much
     * more convenient.
     */
    getRecognizerRunner = () =>
    {
        return this.recognizerRunner;
    };

    /**
     * Getter for {@linkcode videoElement}
     */
    getVideoElement = () =>
    {
        return this.videoElement;
    };

    /**
     * Change currently used camera device for recognition. To get list of
     * available camera devices use `getCameraDevices` method.
     *
     * Keep in mind that this method will reset recognizers.
     *
     * @param camera Desired camera device which should be used for recognition.
     */
    changeCameraDevice = async ( camera: SelectedCamera ) =>
    {
        this.pauseRecognition();
        this.releaseVideoFeed();

        await bindCameraToVideoFeed(
            camera,
            this.videoElement,
            PreferredCameraType.BackFacingCamera,
            this.isProblematicFocus
        );

        await this.resumeRecognition( true );
    };

    /**
     * Shorthand for queuing the next frame for processing. Wrapper around
     * {@linkcode recognitionLoop}. Resolves when the frame is done processing.
     */
    private queueFrame = () =>
    {
        // promisify `requestVideoFrameCallback` so that we know when it triggers
        return new Promise<void>( ( resolve ) =>
        {

            this.frameCallback( () =>
            {
                void this.recognitionLoop().then( () => resolve() );
            } );
        } );
    };

    private throttledQueueFrame = throttle( this.queueFrame );

    /**
     * The main loop. Takes camera frames from {@linkcode videoElement} and
     * processes them on the `recognizerRunner`.
     */
    private recognitionLoop = async () =>
    {
        // exit without side-effects when paused
        if ( this.recognitionPauseRequested )
        {
            return;
        }

        // if cancelled exit and reset `VideoRecognizer` state
        if ( this.recognitionCancelRequested )
        {
            this.clearTimeout();
            await this.resetRecognizers( true );
            this.onScanningDone = null;
            this.recognitionCancelRequested = false;
            return;
        }

        /*
        Start processing.

        At this point we draw the canvas frames, extract the ImageData` and send it
        to the `RecognizerRunner`. The main thread and the worker thread should be
        treated as blocked.
        */
        const cameraFrame = captureFrame( this.videoElement, this.isProblematicFocus );

        // queue everything below in a macrotask
        await new Promise( f => setTimeout( f, 0 ) );

        const processResult = await this.recognizerRunner.processImage( cameraFrame );
        // End processing

        // Test mode resets recognizers on every tick and never times out
        if (
            this.videoRecognitionMode === VideoRecognitionMode.DetectionTest ||
            this.videoRecognitionMode === VideoRecognitionMode.RecognitionTest
        )
        {
            await this.recognizerRunner.resetRecognizers( true );

            this.clearTimeout();
            void this.throttledQueueFrame();
            return;
        }

        // regular flow
        switch ( processResult )
        {
            // `Valid` stops loop and calls `onScanningDone`
            case RecognizerResultState.Valid: {
                this.clearTimeout();

                if ( typeof this.onScanningDone === "function" )
                {
                    this.onScanningDone( processResult );
                }

                return;
            }
            // `Uncertain` resolves after a timeout, loops otherwise
            case RecognizerResultState.Uncertain: {
                // increment timeout
                const now = performance.now();

                if ( this.timeoutStartedAt === 0 )
                {
                    this.timeoutStartedAt = now;
                }

                this.currentTimeoutCount = now - this.timeoutStartedAt;

                // if under timeout continue looping
                if ( this.currentTimeoutCount < this.recognitionTimeoutMs )
                {
                    void this.throttledQueueFrame();
                    return;
                }

                // otherwise stop as `Uncertain`
                this.clearTimeout();

                if ( typeof this.onScanningDone === "function" )
                {
                    this.onScanningDone( processResult );
                }

                return;
            }
            // `StageValid` and `Empty` loop forever
            case RecognizerResultState.StageValid:
            case RecognizerResultState.Empty: {
                this.clearTimeout();
                void this.throttledQueueFrame();

                return;
            }
        }
    };

    /**
     * Clear timeout on every loop which didn't result in `RecognizerResultState.Uncertain`
     */
    private clearTimeout = () =>
    {
        this.currentTimeoutCount = 0;
        this.timeoutStartedAt = 0;
    };

    /**
     * Stops all media stream tracks associated with {@linkcode videoElement}.
     */
    releaseVideoFeed = () =>
    {
        if (
            this.videoElement &&
            this.videoElement.srcObject !== null &&
            this.videoElement.srcObject instanceof MediaStream
        )
        {
            this.videoElement.srcObject.getTracks().forEach( ( track ) => track.stop() );
            this.videoElement.srcObject = null;
        }
    };
}
