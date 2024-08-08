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
    "posterior",
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

const backDualWideCameraLocalizations: string[] = [
    "Cameră dublă cu obiectiv superangular spate",
    "מצלמה כפולה רחבה אחורית",
    "Артқы қос кең бұрышты камера",
    "Câmara grande angular dupla traseira",
    "Πίσω διπλή ευρεία κάμερα",
    "後置雙廣角鏡頭相機",
    "Задна двойна широкоъгълна камера",
    "Càmera dual posterior amb gran angular",
    "Zadná duálna širokouhlá kamera",
    "كاميرا خلفية مزدوجة عريضة",
    "Задняя двойная широкоугольная камера",
    "Задня здвоєна ширококутна камера",
    "Cámara amplia posterior doble",
    "Dwikamera Lebar Belakang",
    "Tylny dwuobiektywowy aparat szerokokątny",
    "Dubbel vidvinkelkamera på baksidan",
    "Back Dual Wide Camera",
    "Hátsó, kettős, széles látószögű kamera",
    "후면 듀얼 와이드 카메라",
    "Double caméra grand angle arrière",
    "Fotocamera doppia con grandangolo (posteriore)",
    "Double appareil photo grand angle arrière",
    "Zadní duální širokoúhlý fotoaparát",
    "Çift Geniş Kamera Arka Yüzü",
    "Laajakulmainen kaksoistakakamera",
    "Rückseitige Dual-Weitwinkelkamera",
    "बैक ड्युअल वाइड कैमरा",
    "后置双广角镜头",
    "Câmera Dupla Grande-Angular Traseira",
    "後置雙廣角相機",
    "กล้องคู่ด้านหลังมุมกว้าง",
    "Kamera Lebar Belakang Ganda",
    "Dobbelt vidvinkelkamera bak",
    "Camera kép rộng mặt sau",
    "Cámara trasera dual con gran angular",
    "背面デュアル広角カメラ",
    "Stražnja dvostruka široka kamera"
];

const backCameraLocalizations: string[] = [
    "후면 카메라",
    "後置相機",
    "Задна камера",
    "後置鏡頭",
    "Camera mặt sau",
    "Hátoldali kamera",
    "Cámara trasera",
    "Back Camera",
    "Kamera på baksidan",
    "Πίσω κάμερα",
    "Bagsidekamera",
    "Zadná kamera",
    "Fotocamera (posteriore)",
    "Câmara traseira",
    "מצלמה אחורית",
    "Takakamera",
    "Rückkamera",
    "Caméra arrière",
    "Zadní fotoaparát",
    "Артқы камера",
    "Tylny aparat",
    "बैक कैमरा",
    "Hátsó kamera",
    "Camera aan achterzijde",
    "Kamera Belakang",
    "Câmera Traseira",
    "Stražnja kamera",
    "الكاميرا الخلفية",
    "Càmera posterior",
    "Fotocamera posteriore",
    "Càmera del darrere",
    "กล้องด้านหลัง",
    "Cameră spate",
    "Kamera, bagside",
    "背面カメラ",
    "Задня камера",
    "Arka Kamera",
    "后置相机",
    "Камера на задней панели",
    "后置镜头",
    "Kamera bak",
    "Задняя камера",
    "Aparat tylny",
    "Kamera på baksiden",
    "Câmera de Trás"
];

export const isAndroidDevice = () =>
{
    const u = navigator.userAgent;
    return !!u.match( /Android/i );
};

export const isIOSDevice = () =>
{
    const u = navigator.userAgent;
    return !!u.match( /iPhone/i );
};

export const isMobileDevice = () =>
{
    return isAndroidDevice() || isIOSDevice();
};

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

    constructor( mdi: MediaDeviceInfo, facing: PreferredCameraType, label?: string )
    {
        this.deviceId = mdi.deviceId;
        this.facing = facing;
        this.groupId = mdi.groupId;


        // apply custom label
        if ( label )
        {
            this.label = label;
        }
        else
        {
            this.label = mdi.label;

        }
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

    let backCameraIterator = 0;
    let frontCameraIterator = 0;

    for ( const camera of cameras )
    {
        // phone back camera
        if ( isBackCameraLabel( camera.label ) )
        {
            backCameraIterator++;
            let backLabel: string | undefined = undefined;
            // we apply a custom label on Android devices
            if ( isAndroidDevice() )
            {
                backLabel = `Back camera ${backCameraIterator}`;
            }
            backCameras.push( new SelectedCamera( camera, PreferredCameraType.BackFacingCamera, backLabel ) );
        }
        else
        // front camera or non-phone camera
        {
            frontCameraIterator++;
            let frontLabel: string | undefined = undefined;
            if ( isAndroidDevice() )
            {
                // we apply a custom label on Android devices
                frontLabel = `Front camera ${frontCameraIterator}`;
            }
            frontCameras.push( new SelectedCamera( camera, PreferredCameraType.FrontFacingCamera, frontLabel ) );
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

    if ( !frontCameras.length && !backCameras.length )
    {
        return null;
    }

    // Picks camera based on the provided device id, if user provided device id up front
    if ( cameraId )
    {
        let cameraDevice: SelectedCamera | undefined;

        cameraDevice = frontCameras.find( device => device.deviceId === cameraId );

        if ( !cameraDevice )
        {
            cameraDevice = backCameras.find( device => device.deviceId === cameraId );
        }

        return cameraDevice || null;
    }

    let cameraDevice: SelectedCamera | null = null;

    if ( isIOSDevice() && preferredCameraType === PreferredCameraType.BackFacingCamera )
    {
        // If device is an iOS and preferred camera is back facing
        // pick camera which matches the localized 'Back Dual Wide Camera'

        let selectedCamera = backCameras.find
        ( camera => backDualWideCameraLocalizations.includes( camera.label ) );

        if ( !selectedCamera )
        {
            selectedCamera = backCameras.find( camera => backCameraLocalizations.includes( camera.label ) );
        }

        if ( selectedCamera )
        {
            cameraDevice = selectedCamera;
        }
    }
    else if ( isAndroidDevice() && preferredCameraType === PreferredCameraType.BackFacingCamera )
    {
        type Candidate = { deviceId: string; score: number };
        let bestCameraDevice: Candidate = {
            deviceId: "",
            score: -1,
        };
        const calculateScore = ( hasTorch: boolean, hasSingleShot: boolean ) =>
        {
            let score = 0;
            if ( hasTorch ) score++;
            if ( hasSingleShot ) score++;
            return score;
        };

        for ( const backFacingCamera of backCameras )
        {
            const mediaStream = await navigator.mediaDevices.getUserMedia(
                {
                    video: {
                        deviceId: backFacingCamera.deviceId,
                        width: 1920,
                        height: 1080,
                    },
                }
            );

            if ( "getCapabilities" in mediaStream.getVideoTracks()[0] )
            {
                const capabilities = mediaStream.getVideoTracks()[0].getCapabilities();

                // @ts-expect-error Property will exist on object
                const hasTorch = Boolean( capabilities.torch );

                // @ts-expect-error Property will exist on object
                const hasSingleShot = ( capabilities.focusMode as string[] )?.includes( "single-shot" );

                const cameraScore = calculateScore( hasTorch, hasSingleShot );

                if ( cameraScore > bestCameraDevice.score )
                {
                    bestCameraDevice = {
                        deviceId: backFacingCamera.deviceId,
                        score: cameraScore,
                    };
                }
            }

            closeStreamTracks( mediaStream );
        }

        cameraDevice = backCameras.find( camera => camera.deviceId === bestCameraDevice.deviceId ) || null;
    }

    if ( cameraDevice === null )
    {
        // Case where camera device is still not found, so we revert back to "old" logic

        // Decide from which array the camera will be selected
        let cameraPool: SelectedCamera[] = ( backCameras.length > 0 ? backCameras : frontCameras );

        // If there is at least one back facing camera and user prefers back facing camera, use that as a selection pool
        if ( preferredCameraType === PreferredCameraType.BackFacingCamera && backCameras.length > 0 )
        {
            cameraPool = backCameras;
        }

        // If there is at least one front facing camera and is preferred by user, use that as a selection pool
        if ( preferredCameraType === PreferredCameraType.FrontFacingCamera && frontCameras.length > 0 )
        {
            cameraPool = frontCameras;
        }

        // Sort camera pool by label
        cameraPool = cameraPool.sort( ( camera1, camera2 ) => camera1.label.localeCompare( camera2.label ) );

        // Check if cameras are labeled with resolution information, take the higher-resolution one in that case
        // Otherwise pick the last camera (Samsung wide on most Android devices)
        let selectedCameraIndex = cameraPool.length - 1;

        // Gets camera resolutions from the device name, if exists
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

        // Picks camera  based on highest resolution in the name
        if ( !cameraResolutions.some( cameraResolution => isNaN( cameraResolution ) ) )
        {
            selectedCameraIndex = cameraResolutions.lastIndexOf( Math.max( ...cameraResolutions ) );
        }

        return cameraPool[ selectedCameraIndex ];
    }

    return cameraDevice;
}

const closeStreamTracks = ( stream: MediaStream ) =>
{
    const tracks = stream.getTracks();
    for ( const track of tracks )
    {
        track.stop();
    }
};

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
                max: 1920,
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

    let cameraFlipped = false;
    if ( camera.facing === PreferredCameraType.FrontFacingCamera )
    {
        cameraFlipped = true;
    }

    return cameraFlipped;
}
