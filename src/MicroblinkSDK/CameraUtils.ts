/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * Preferred type of camera to be used when opening the camera feed.
 */
export enum PreferredCameraType
{
    /** Prefer back facing camera */
    BackFacingCamera,
    /** Prefer front facing camera */
    FrontFacingCamera
}

// inspired by https://unpkg.com/browse/scandit-sdk@4.6.1/src/lib/cameraAccess.ts
const backCameraKeywords: string[] = [
    "rear",
    "back",
    "rück",
    "arrière",
    "trasera",
    "trás",
    "traseira",
    "posteriore",
    "后面",
    "後面",
    "背面",
    "后置", // alternative
    "後置", // alternative
    "背置", // alternative
    "задней",
    "الخلفية",
    "후",
    "arka",
    "achterzijde",
    "หลัง",
    "baksidan",
    "bagside",
    "sau",
    "bak",
    "tylny",
    "takakamera",
    "belakang",
    "אחורית",
    "πίσω",
    "spate",
    "hátsó",
    "zadní",
    "darrere",
    "zadná",
    "задня",
    "stražnja",
    "belakang",
    "बैक"
];

function isBackCameraLabel( label: string ): boolean
{
    const lowercaseLabel = label.toLowerCase();

    return backCameraKeywords.some( keyword => lowercaseLabel.includes( keyword ) );
}

export class SelectedCamera
{
    readonly deviceId: string;

    readonly groupId: string;

    readonly facing: PreferredCameraType;

    readonly label: string;

    constructor( mdi: MediaDeviceInfo, facing: PreferredCameraType )
    {
        this.deviceId = mdi.deviceId;
        this.facing = facing;
        this.groupId = mdi.groupId;
        this.label = mdi.label;
    }
}

export interface CameraDevices
{
    frontCameras: SelectedCamera[];
    backCameras: SelectedCamera[];
}

export async function getCameraDevices(): Promise< CameraDevices >
{
    const frontCameras: SelectedCamera[] = [];
    const backCameras: SelectedCamera[] = [];

    {
        let devices = await navigator.mediaDevices.enumerateDevices();
        // if permission is not given, label of video devices will be empty string
        if ( devices.filter( device => device.kind === "videoinput" ).every( device => device.label === "" ) )
        {
            const stream = await navigator.mediaDevices.getUserMedia
            (
                {
                    video:
                    {
                        facingMode: { ideal: "environment" }
                    },
                    audio: false
                }
            );

            // enumerate devices again - now the label field should be non-empty, as we have a stream active
            // (even if we didn't get persistent permission for camera)
            devices = await navigator.mediaDevices.enumerateDevices();

            // close the stream, as we don't need it anymore
            stream.getTracks().forEach( track => track.stop() );
        }

        const cameras = devices.filter( device => device.kind === "videoinput" );
        for ( const camera of cameras )
        {
            if ( isBackCameraLabel( camera.label ) )
            {
                backCameras.push( new SelectedCamera( camera, PreferredCameraType.BackFacingCamera ) );
            }
            else
            {
                frontCameras.push( new SelectedCamera( camera, PreferredCameraType.FrontFacingCamera ) );
            }
        }
    }

    return {
        frontCameras,
        backCameras
    };
}

export async function selectCamera(
    cameraId:               string | null,
    preferredCameraType:    PreferredCameraType
): Promise< SelectedCamera | null >
{
    const { frontCameras, backCameras } = await getCameraDevices();

    if ( frontCameras.length > 0 || backCameras.length > 0 )
    {
        // decide from which array the camera will be selected
        let cameraPool: SelectedCamera[] = ( backCameras.length > 0 ? backCameras : frontCameras );
        // if there is at least one back facing camera and user prefers back facing camera, use that as a selection pool
        if ( preferredCameraType === PreferredCameraType.BackFacingCamera && backCameras.length > 0 )
        {
            cameraPool = backCameras;
        }
        // if there is at least one front facing camera and is preferred by user, use that as a selection pool
        if ( preferredCameraType === PreferredCameraType.FrontFacingCamera && frontCameras.length > 0 )
        {
            cameraPool = frontCameras;
        }
        // otherwise use whichever pool is non-empty

        // sort camera pool by label
        cameraPool = cameraPool.sort( ( camera1, camera2 ) => camera1.label.localeCompare( camera2.label ) );

        // Check if cameras are labeled with resolution information, take the higher-resolution one in that case
        // Otherwise pick the first camera
        {
            let selectedCameraIndex = 0;

            const cameraResolutions: number[] = cameraPool.map
            (
                camera =>
                {
                    const regExp = RegExp( /\b([0-9]+)MP?\b/, "i" );
                    const match = regExp.exec( camera.label );
                    if ( match !== null )
                    {
                        return parseInt( match[1], 10 );
                    }
                    else
                    {
                        return NaN;
                    }
                }
            );
            if ( !cameraResolutions.some( cameraResolution => isNaN( cameraResolution ) ) )
            {
                selectedCameraIndex = cameraResolutions.lastIndexOf( Math.max( ...cameraResolutions ) );
            }
            if ( cameraId )
            {
                let cameraDevice: SelectedCamera;

                cameraDevice = frontCameras.filter( device => device.deviceId === cameraId )[0];
                if ( !cameraDevice )
                {
                    cameraDevice = backCameras.filter( device => device.deviceId === cameraId )[0];
                }

                return cameraDevice || null;
            }

            return cameraPool[ selectedCameraIndex ];
        }
    }
    else
    {
        // no cameras available on the device
        return null;
    }
}

/**
 * Bind camera device to video feed (HTMLVideoElement).
 *
 * This function will return `true` in case that video feed of camera device has been flipped,
 * and `false` otherwise.
 *
 * @param camera                Camera device which should be binded with the video element.
 * @param videoFeed             HTMLVideoElement to which camera device should be binded.
 * @param preferredCameraType   Enum representing whether to use front facing or back facing camera.
 */
export async function bindCameraToVideoFeed(
    camera:                 SelectedCamera,
    videoFeed:              HTMLVideoElement,
    preferredCameraType:    PreferredCameraType = PreferredCameraType.BackFacingCamera,
    shouldMaxResolution = false
): Promise< boolean >
{
    const constraints: MediaStreamConstraints =
    {
        audio: false,
        video:
        {
            width:
            {
                min: 640,
                ideal: 1920,
                max: 1920
            },
            height:
            {
                min: 480,
                ideal: 1080,
                max: 1080
            }
        }
    };

    if ( camera.deviceId === "" )
    {
        const isPreferredBackFacing = preferredCameraType === PreferredCameraType.BackFacingCamera;
        ( constraints.video as MediaTrackConstraints ).facingMode =
        {
            ideal: isPreferredBackFacing ? "environment" : "user"
        };
    }
    else
    {
        ( constraints.video as MediaTrackConstraints ).deviceId =
        {
            exact: camera.deviceId
        };
    }

    const stream = await navigator.mediaDevices.getUserMedia( constraints );
    videoFeed.controls = false;
    videoFeed.srcObject = stream;

    const videoFeedTransform: Array< string > = [];
    let cameraFlipped = false;
    if ( camera.facing === PreferredCameraType.FrontFacingCamera )
    {
        videoFeedTransform.push( "scaleX(-1)" );
        cameraFlipped = true;
    }

    if ( shouldMaxResolution )
    {
        const tracks       = stream.getVideoTracks();
        const track        = tracks[ 0 ];
        const capabilities = track.getCapabilities();

        void track.applyConstraints
        (
            {
                width: capabilities.width?.max,
                height: capabilities.height?.max
            }
        );

        // Scale should be ~1.5 if 66% of the image is cropped (see cropFactor in FrameCapture.ts)
        videoFeedTransform.push( "scale(1.5)" );
    }

    videoFeed.style.transform = videoFeedTransform.join( " " );

    return cameraFlipped;
}

export function clearVideoFeed( videoFeed: HTMLVideoElement ): void
{
    if ( videoFeed && videoFeed.srcObject !== null )
    {
        ( videoFeed.srcObject as MediaStream ).getTracks().forEach( track => track.stop() );
        videoFeed.srcObject = null;
    }
}

export function isCameraFocusProblematic(): boolean
{
    return navigator.userAgent.indexOf( "iPhone OS 16_" ) > -1;
}
