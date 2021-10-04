/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import
{
    bindCameraToVideoFeed,
    PreferredCameraType,
    clearVideoFeed,
    selectCamera,
    SelectedCamera
} from "./CameraUtils";

import
{
    RecognizerRunner,
    RecognizerResultState
} from "./DataStructures";

import { captureFrame } from "./FrameCapture";

/**
 * Explanation why VideoRecognizer has failed to open the camera feed.
 */
export enum NotSupportedReason
{
    /** navigator.mediaDevices.getUserMedia is not supported by current browser for current context. */
    MediaDevicesNotSupported = "MediaDevicesNotSupported",
    /** Camera with requested features is not available on current device. */
    CameraNotFound = "CameraNotFound",
    /** Camera access was not granted by the user. */
    CameraNotAllowed = "CameraNotAllowed",
    /** Unable to start playing because camera is already in use. */
    CameraInUse = "CameraInUse",
    /** Camera is currently not available due to a OS or hardware error. */
    CameraNotAvailable = "CameraNotAvailable",
    /** There is no provided video element to which the camera feed should be redirected. */
    VideoElementNotProvided = "VideoElementNotProvided"
}

/**
 * The error object thrown when VideoRecognizer fails to open the camera feed.
 */
export class VideoRecognizerError extends Error
{
    /** The reason why opening the camera failed. */
    readonly reason: NotSupportedReason;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    constructor( reason: NotSupportedReason, ...params: any[] )
    {
        super( ...params );
        this.reason = reason;
        this.name = "VideoRecognizerError";
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
}

/**
 * Indicates mode of recognition in VideoRecognizer.
 */
export enum VideoRecognitionMode
{
    /** Normal recognition */
    Recognition,
    /** Indefinite scan. Useful for profiling the performance of scan (using onDebugText metadata callback) */
    RecognitionTest,
    /** Only detection. Useful for profiling the performance of detection (using onDebugText metadata callback) */
    DetectionTest
}

/**
 * Invoked when VideoRecognizer finishes the recognition of the video stream.
 * @param recognitionState The state of recognition after finishing. If RecognizerResultState.Empty or
 *                         RecognizerResultState.Empty are returned, this indicates that the scanning
 *                         was cancelled or timeout has been reached.
 */
export type OnScanningDone = ( recognitionState: RecognizerResultState ) => Promise< void > | void;

/**
 * A wrapper around RecognizerRunner that can use it to perform recognition of video feeds - either from live camera or
 * from predefined video file.
 */
export class VideoRecognizer
{
    /**
     * Creates a new VideoRecognizer by opening a camera stream and attaching it to given HTMLVideoElement. If camera
     * cannot be accessed, the returned promise will be rejected.
     *
     * @param cameraFeed HTMLVideoELement to which camera stream should be attached
     * @param recognizerRunner RecognizerRunner that should be used for video stream recognition
     * @param cameraId User can provide specific camera ID to be selected and used
     * @param preferredCameraType Whether back facing or front facing camera is preferred. Obeyed only if there is
     *        a choice (i.e. if device has only front-facing camera, the opened camera will be a front-facing camera,
     *        regardless of preference)
     */
    static async createVideoRecognizerFromCameraStream
    (
        cameraFeed:             HTMLVideoElement,
        recognizerRunner:       RecognizerRunner,
        cameraId:               string | null = null,
        preferredCameraType:    PreferredCameraType = PreferredCameraType.BackFacingCamera
    ): Promise< VideoRecognizer >
    {
        // TODO: refactor this function into async/await syntax, instead of reject use throw
        /* eslint-disable */
        return new Promise< VideoRecognizer >
        (
            async ( resolve, reject ) =>
            {
                // Check for tag name intentionally left out, so it's possible to use VideoRecognizer with custom elements.
                if ( !cameraFeed || !( cameraFeed instanceof Element ) )
                {
                    const errorMessage = "Video element, i.e. camera feed is not provided!";
                    reject( new VideoRecognizerError( NotSupportedReason.VideoElementNotProvided, errorMessage ) );
                    return;
                }
                if ( navigator.mediaDevices && navigator.mediaDevices.getUserMedia !== undefined )
                {
                    try
                    {
                        const selectedCamera = await selectCamera( cameraId, preferredCameraType );

                        if ( selectedCamera === null )
                        {
                            reject( new VideoRecognizerError( NotSupportedReason.CameraNotFound ) );
                            return;
                        }

                        const cameraFlipped = await bindCameraToVideoFeed( selectedCamera, cameraFeed, preferredCameraType );

                        // TODO: await maybe not needed here
                        await recognizerRunner.setCameraPreviewMirrored( cameraFlipped );
                        resolve( new VideoRecognizer(
                            cameraFeed,
                            recognizerRunner,
                            cameraFlipped,
                            false,
                            selectedCamera.deviceId
                        ) );
                    }
                    catch( error )
                    {
                        let errorReason = NotSupportedReason.CameraInUse;
                        switch( error.name )
                        {
                            case "NotFoundError":
                            case "OverconstrainedError":
                                errorReason = NotSupportedReason.CameraNotFound;
                                break;
                            case "NotAllowedError":
                            case "SecurityError":
                                errorReason = NotSupportedReason.CameraNotAllowed;
                                break;
                            case "AbortError":
                            case "NotReadableError":
                                errorReason = NotSupportedReason.CameraNotAvailable;
                                break;
                            case "TypeError": // this should never happen. If it does, rethrow it
                                throw error;
                        }
                        reject( new VideoRecognizerError( errorReason, error.message ) );
                    }
                }
                else
                {
                    reject( new VideoRecognizerError( NotSupportedReason.MediaDevicesNotSupported ) );
                }
            }
        );
        /* eslint-enable */
    }

    /**
     * Creates a new VideoRecognizer by attaching the given URL to video to given HTMLVideoElement and using it to
     * display video frames while processing them.
     *
     * @param videoPath URL of the video file that should be recognized.
     * @param videoFeed HTMLVideoElement to which video file will be attached
     * @param recognizerRunner RecognizerRunner that should be used for video stream recognition.
     */
    static async createVideoRecognizerFromVideoPath
    (
        videoPath        : string,
        videoFeed        : HTMLVideoElement,
        recognizerRunner : RecognizerRunner
    ): Promise< VideoRecognizer >
    {
        return new Promise
        (
            ( resolve: ( videoRecognizer: VideoRecognizer ) => void ) =>
            {
                videoFeed.src = videoPath;
                videoFeed.currentTime = 0;
                videoFeed.onended = () =>
                {
                    videoRecognizer.cancelRecognition();
                };
                const videoRecognizer = new VideoRecognizer( videoFeed, recognizerRunner );
                resolve( videoRecognizer );
            }
        );
    }

    /**
     * **Use only if provided factory functions are not well-suited for your use case.**
     *
     * Creates a new VideoRecognizer with provided HTMLVideoElement.
     *
     * Keep in mind that HTMLVideoElement **must have** a video feed which is ready to use.
     *
     * - If you want to take advantage of provided camera management, use `createVideoRecognizerFromCameraStream`
     * - In case that static video file should be processed, use `createVideoRecognizerFromVideoPath`
     *
     * @param videoFeed HTMLVideoElement with video feed which is going to be processed
     * @param recognizerRunner RecognizerRunner that should be used for video stream recognition
     * @param cameraFlipped Whether the camera is flipped, e.g. if front-facing camera is used
     * @param allowManualVideoPlayout Whether to allow manual video playout. Default value is `false`
     */
    constructor
    (
        videoFeed: HTMLVideoElement,
        recognizerRunner: RecognizerRunner,
        cameraFlipped = false,
        allowManualVideoPlayout = false,
        deviceId: string | null = null
    )
    {
        this.videoFeed = videoFeed;
        this.recognizerRunner = recognizerRunner;
        this.cameraFlipped = cameraFlipped;
        this.allowManualVideoPlayout = allowManualVideoPlayout;
        this.deviceId = deviceId;
    }

    deviceId: string | null = null;

    async flipCamera(): Promise< void >
    {
        if ( this.videoFeed )
        {
            if ( !this.cameraFlipped )
            {
                this.videoFeed.style.transform = "scaleX(-1)";
                this.cameraFlipped = true;
            }
            else
            {
                this.videoFeed.style.transform = "scaleX(1)";
                this.cameraFlipped = false;
            }

            await this.recognizerRunner.setCameraPreviewMirrored( this.cameraFlipped );
        }
    }

    /**
     * Sets the video recognition mode to be used.
     *
     * @param videoRecognitionMode the video recognition mode to be used.
     */
    async setVideoRecognitionMode( videoRecognitionMode: VideoRecognitionMode ): Promise< void >
    {
        this.videoRecognitionMode = videoRecognitionMode;
        const isDetectionMode = this.videoRecognitionMode === VideoRecognitionMode.DetectionTest;
        await this.recognizerRunner.setDetectionOnlyMode( isDetectionMode );
    }

    /**
     * Starts the recognition of the video stream associated with this VideoRecognizer. The stream will be unpaused and
     * recognition loop will start. After recognition completes, a onScanningDone callback will be invoked with state of
     * the recognition.
     *
     * NOTE: As soon as the execution of the callback completes, the recognition loop will continue and recognition
     *       state will be retained. To clear the recognition state, use resetRecognizers (within your callback). To
     *       pause the recognition loop, use pauseRecognition (within your callback) - to resume it later use
     *       resumeRecognition. To completely stop the recognition and video feed, while keeping the ability to use this
     *       VideoRecognizer later, use pauseVideoFeed. To completely stop the recognition and video feed and release
     *       all the resources involved with video stream, use releaseVideoFeed.
     *
     * @param onScanningDone Callback that will be invoked when recognition completes.
     * @param recognitionTimeoutMs Amount of time before returned promise will be resolved regardless of whether
     *        recognition was successful or not.
     */
    startRecognition( onScanningDone: OnScanningDone, recognitionTimeoutMs = 20000 ): Promise< void >
    {
        return new Promise( ( resolve, reject ) =>
        {
            if ( this.videoFeed === null )
            {
                reject( new Error( "The associated video feed has been released!" ) );
                return;
            }
            if ( !this.videoFeed.paused )
            {
                reject( new Error( "The associated video feed is not paused. Use resumeRecognition instead!" ) );
                return;
            }

            this.cancelled = false;
            this.recognitionPaused = false;
            this.clearTimeout();
            this.recognitionTimeoutMs = recognitionTimeoutMs;
            this.onScanningDone = onScanningDone;
            void this.recognizerRunner.setClearTimeoutCallback( { onClearTimeout: () => this.clearTimeout() } );
            this.videoFeed.play().then
            (
                () => this.playPauseEvent().then
                (
                    () => resolve()
                ).catch
                (
                    ( error ) => reject( error )
                ),
                /* eslint-disable @typescript-eslint/no-explicit-any */
                ( nativeError: any ) =>
                {
                    if ( !this.allowManualVideoPlayout )
                    {
                        console.warn( "Native error", nativeError );
                        reject
                        (
                            new Error( "The play() request was interrupted or prevented by browser security rules!" )
                        );
                        return;
                    }

                    if ( !this.videoFeed )
                    {
                        return;
                    }

                    this.videoFeed.controls = true;
                    this.videoFeed.addEventListener
                    (
                        "play" ,
                        () => void this.playPauseEvent().then().catch( ( error ) => reject( error ) )
                    );
                    this.videoFeed.addEventListener
                    (
                        "pause",
                        () => void this.playPauseEvent().then().catch( ( error ) => reject( error ) )
                    );
                }
                /* eslint-enable @typescript-eslint/no-explicit-any */
            );
        } );
    }

    /**
     * Performs the recognition of the video stream associated with this VideoRecognizer. The stream will be
     * unpaused, recognition will be performed and promise will be resolved with recognition status. After
     * the resolution of returned promise, the video stream will be paused, but not released. To release the
     * stream, use function releaseVideoFeed.
     *
     * This is a simple version of startRecognition that should be used for most cases, like when you only need
     * to perform one scan per video session.
     *
     * @param recognitionTimeoutMs Amount of time before returned promise will be resolved regardless of whether
     *        recognition was successful or not.
     */
    recognize( recognitionTimeoutMs = 20000 ): Promise< RecognizerResultState >
    {
        return new Promise
        (
            ( resolve: ( recognitionStatus: RecognizerResultState ) => void, reject ) =>
            {
                try
                {
                    void this.startRecognition
                    (
                        ( recognitionState: RecognizerResultState ) =>
                        {
                            this.pauseVideoFeed();
                            resolve( recognitionState );
                        },
                        recognitionTimeoutMs
                    ).then
                    (
                        // Do nothing, callback is used for resolving
                    ).catch
                    (
                        ( error ) => reject( error )
                    );
                }
                catch ( error )
                {
                    reject( error );
                }
            }
        );
    }

    /**
     * Cancels current ongoing recognition. Note that after cancelling the recognition, the callback given to
     * startRecognition will be immediately called. This also means that the promise returned from method
     * recognize will be resolved immediately.
     */
    cancelRecognition(): void
    {
        this.cancelled = true;
    }

    /**
     * Pauses the video feed. You can resume the feed by calling recognize or startRecognition.
     * Note that this pauses both the camera feed and recognition. If you just want to pause
     * recognition, while keeping the camera feed active, call method pauseRecognition.
     */
    pauseVideoFeed(): void
    {
        this.pauseRecognition();

        if ( this.videoFeed )
        {
            this.videoFeed.pause();
        }
    }

    /**
     * Pauses the recognition. This means that video frames that arrive from given video source
     * will not be recognized. To resume recognition, call resumeRecognition(boolean).
     * Unlike cancelRecognition, the callback given to startRecognition will not be invoked after pausing
     * the recognition (unless there is already processing in-flight that may call the callback just before
     * pausing the actual recognition loop).
     */
    pauseRecognition(): void
    {
        this.recognitionPaused = true;
    }

    /**
     * Convenience method for invoking resetRecognizers on associated RecognizerRunner.
     * @param hardReset Same as in RecognizerRunner.resetRecognizers.
     */
    async resetRecognizers( hardReset: boolean ): Promise< void >
    {
        await this.recognizerRunner.resetRecognizers( hardReset );
    }

    /**
     * Convenience method for accessing RecognizerRunner associated with this VideoRecognizer.
     * Sometimes it's useful to reconfigure RecognizerRunner while handling onScanningDone callback
     * and this method makes that much more convenient.
     */
    getRecognizerRunner(): RecognizerRunner
    {
        return this.recognizerRunner;
    }

    /**
     * Resumes the recognition. The video feed must not be paused. If it is, an error will be thrown.
     * If video feed is paused, you should use recognize or startRecognition methods.
     * @param resetRecognizers Indicates whether resetRecognizers should be invoked while resuming the recognition
     */
    resumeRecognition( resetRecognizers: boolean ): Promise< void >
    {
        return new Promise( ( resolve, reject ) =>
        {
            this.cancelled = false;
            this.timedOut = false;
            this.recognitionPaused = false;

            if ( this.videoFeed && this.videoFeed.paused )
            {
                const msg = "Cannot resume recognition while video feed is paused! Use recognize or startRecognition";
                reject( new Error( msg ) );
                return;
            }

            setTimeout
            (
                () =>
                {
                    if ( resetRecognizers )
                    {
                        this.resetRecognizers( true ).then
                        (
                            () =>
                            {
                                this.recognitionLoop().then
                                (
                                    () => resolve()
                                ).catch
                                (
                                    ( error ) => reject( error )
                                );
                            }
                        ).catch
                        (
                            () =>
                            {
                                reject( new Error( "Could not reset recognizers!" ) );
                            }
                        );
                    }
                    else
                    {
                        void this.recognitionLoop().then
                        (
                            () => resolve()
                        ).catch
                        (
                            ( error ) => reject( error )
                        );
                    }
                },
                1
            );
        } );
    }

    /**
     * Stops all media stream tracks associated with current HTMLVideoElement and removes any references to it.
     * Note that after calling this method you can no longer use this VideoRecognizer for recognition.
     * This method should be called after you no longer plan on performing video recognition to let browser know
     * that it can release resources related to any media streams used.
     */
    releaseVideoFeed(): void
    {
        if ( !this.videoFeed || this.videoFeed?.readyState < this.videoFeed?.HAVE_CURRENT_DATA )
        {
            this.shouldReleaseVideoFeed = true;
            return;
        }

        if ( !this.videoFeed.paused )
        {
            this.cancelRecognition();
        }

        clearVideoFeed( this.videoFeed );
        this.videoFeed = null;
        this.shouldReleaseVideoFeed = false;
    }

    /**
     * Change currently used camera device for recognition. To get list of available camera devices
     * use "getCameraDevices" method.
     *
     * Keep in mind that this method will reset recognizers.
     *
     * @param camera Desired camera device which should be used for recognition.
     */
    changeCameraDevice( camera: SelectedCamera ): Promise< void >
    {
        return new Promise( ( resolve, reject ) =>
        {
            if ( this.videoFeed === null )
            {
                reject( new Error( "Cannot change camera device because video feed is missing!" ) );
                return;
            }

            this.pauseRecognition();
            clearVideoFeed( this.videoFeed );

            bindCameraToVideoFeed( camera, this.videoFeed ).then
            (
                () =>
                {
                    if ( this.videoFeed === null )
                    {
                        reject( new Error( "Cannot change camera device because video feed is missing!" ) );
                        return;
                    }

                    this.videoFeed.play().then
                    (
                        () =>
                        {
                            // Recognition errors should be handled by `startRecognition` or `recognize` method
                            void this.resumeRecognition( true );
                            resolve();
                        },
                        /* eslint-disable @typescript-eslint/no-explicit-any */
                        ( nativeError: any ) =>
                        {
                            if ( !this.allowManualVideoPlayout )
                            {
                                console.warn( "Native error", nativeError );
                                const m = "The play() request was interrupted or prevented by browser security rules!";
                                reject( new Error( m ) );
                                return;
                            }

                            if ( !this.videoFeed )
                            {
                                reject( new Error( "Cannot change camera device because video feed is missing!" ) );
                                return;
                            }

                            this.videoFeed.controls = true;
                        }
                        /* eslint-enable @typescript-eslint/no-explicit-any */
                    );
                }
            ).catch
            (
                ( error ) => reject( error )
            );
        } );
    }

    /** *********************************************************************************************
     * PRIVATE AREA
     */

    private videoFeed: HTMLVideoElement | null = null;

    private recognizerRunner: RecognizerRunner;

    private cancelled = false;

    private timedOut = false;

    private recognitionPaused = false;

    private recognitionTimeoutMs = 20000;

    private timeoutID = 0;

    private videoRecognitionMode: VideoRecognitionMode = VideoRecognitionMode.Recognition;

    private onScanningDone: OnScanningDone | null = null;

    private allowManualVideoPlayout = false;

    private cameraFlipped = false;

    private shouldReleaseVideoFeed = false;

    private playPauseEvent(): Promise< void >
    {
        return new Promise( ( resolve, reject ) =>
        {
            if ( this.videoFeed && this.videoFeed.paused )
            {
                this.cancelRecognition();
                resolve();
                return;
            }
            else
            {
                this.resumeRecognition( true ).then
                (
                    () => resolve()
                ).catch
                (
                    ( error ) => reject( error )
                );
            }

        } );
    }

    private recognitionLoop(): Promise< void >
    {
        return new Promise( ( resolve, reject ) =>
        {
            if ( !this.videoFeed )
            {
                reject( new Error( "Missing video feed!" ) );
                return;
            }

            if ( this.shouldReleaseVideoFeed && this.videoFeed.readyState > this.videoFeed.HAVE_CURRENT_DATA )
            {
                this.releaseVideoFeed();
                resolve();
                return;
            }

            const cameraFrame = captureFrame( this.videoFeed );

            this.recognizerRunner.processImage( cameraFrame ).then
            (
                ( processResult: RecognizerResultState ) =>
                {
                    const completeFn = () =>
                    {
                        if ( !this.recognitionPaused )
                        {
                            // ensure browser events are processed and then recognize another frame
                            setTimeout( () =>
                            {
                                this.recognitionLoop().then
                                (
                                    () => resolve()
                                ).catch
                                (
                                    ( error ) => reject( error )
                                );
                            }, 1 );
                        }
                        else
                        {
                            resolve();
                        }
                    };

                    if ( processResult === RecognizerResultState.Valid || this.cancelled || this.timedOut )
                    {
                        if ( this.videoRecognitionMode === VideoRecognitionMode.Recognition || this.cancelled )
                        {
                            // valid results, clear the timeout and invoke the callback
                            this.clearTimeout();
                            if ( this.onScanningDone )
                            {
                                void this.onScanningDone( processResult );
                            }
                            // after returning from callback, resume scanning if not paused
                        }
                        else
                        {
                            // in test mode - reset the recognizers and continue the loop indefinitely
                            this.recognizerRunner.resetRecognizers( true ).then
                            (
                                () =>
                                {
                                    // clear any time outs
                                    this.clearTimeout();
                                    completeFn();
                                }
                            ).catch
                            (
                                ( error ) => reject( error )
                            );
                            return;
                        }
                    }
                    else if ( processResult === RecognizerResultState.Uncertain )
                    {
                        if ( this.timeoutID === 0 )
                        {
                            // first non-empty result - start timeout
                            this.timeoutID = window.setTimeout(
                                () => { this.timedOut = true; },
                                this.recognitionTimeoutMs
                            );
                        }
                        completeFn();
                        return;
                    }
                    else if ( processResult === RecognizerResultState.StageValid )
                    {
                        // stage recognition is finished, clear timeout and resume recognition
                        this.clearTimeout();
                        completeFn();
                        return;
                    }

                    completeFn();
                }
            ).catch
            (
                ( error ) => reject( error )
            );
        } );
    }

    private clearTimeout()
    {
        if ( this.timeoutID > 0 )
        {
            window.clearTimeout( this.timeoutID );
            this.timeoutID = 0;
        }
    }
}
