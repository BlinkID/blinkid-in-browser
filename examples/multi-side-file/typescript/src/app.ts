/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * This example app demonstrates how to use BlinkID In-browser SDK to achieve the following:
 *
 * - Change default SDK settings
 * - Scan front and back side of the identity document with file upload (multi-side experience)
 * - Provide visual feedback to the end-user during the scan
 */
import * as BlinkIDSDK from "@microblink/blinkid-in-browser-sdk";

// General UI helpers
const initialMessageEl = document.getElementById("msg") as HTMLHeadingElement;
const progressEl = document.getElementById("load-progress") as HTMLProgressElement;
const scanImageElement = document.getElementById("target-image") as HTMLImageElement;
const inputImageFileFrontSide = document.getElementById("image-file-front-side") as HTMLInputElement;
const inputImageFileBackSide = document.getElementById("image-file-back-side") as HTMLInputElement;

/**
 * Check browser support, customize settings and load WASM SDK.
 */
function main() {

    // Check if browser has proper support for WebAssembly
    if (!BlinkIDSDK.isBrowserSupported()) {
        initialMessageEl.innerText = "This browser is not supported!";
        return;
    }

    // 1. It's possible to obtain a free trial license key on microblink.com
    const licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpJlWLsMUzyluK70/xuVxz8ABrvYsc6K8qqHwklMLcmZ9e95cYAE2j+KJXGR/GBkeukLaT8sLvD0MjKnYXwQxXUIqQMXC7N/i8ZlbagoJ2pnJu0BDka67+4QI0IWdpYaO9rA5iP9mfNjPUD8ZwchKfS1PzKeoRpyYCYb4q+PLmXwIt/fXXOfG60pMf+ocFcjE9iYg3QSLaE9Zczlv06nzSvvTISR/gN0TXChtPiXiOlLhZ2YrP1dnlve+Cy8Kn5iGx9RzBzY4LR0rCE/U0eS3oxh3EFbyABXQx1wiCWzQgQDGzBljhM6yN+le1hs3oS6kOUY=";

    // 2. Create instance of SDK load settings with your license key
    const loadSettings = new BlinkIDSDK.WasmSDKLoadSettings(licenseKey);

    // [OPTIONAL] Change default settings

    // Show or hide hello message in browser console when WASM is successfully loaded
    loadSettings.allowHelloMessage = true;

    // In order to provide better UX, display progress bar while loading the SDK
    loadSettings.loadProgressCallback = (progress: number) => progressEl!.value = progress;

    // Set absolute location of the engine, i.e. WASM and support JS files
    loadSettings.engineLocation = window.location.href;

    // Set absolute location of the worker file
    loadSettings.workerLocation = window.location.origin + "/BlinkIDWasmSDK.worker.min.js";

    // 3. Load SDK
    BlinkIDSDK.loadWasmModule(loadSettings).then((sdk: BlinkIDSDK.WasmSDK) => {
        document.getElementById("screen-initial")?.classList.add("hidden");
        document.getElementById("screen-start")?.classList.remove("hidden");
        document.getElementById("start-button")?.addEventListener("click", (ev: any) => {
            ev.preventDefault();
            startScan(sdk);
        });
    }, (error: any) => {
        initialMessageEl.innerText = "Failed to load SDK!";
        console.error("Failed to load SDK!", error);
    });
}

/**
 * Scan single side of identity document with web camera.
 */
async function startScan(sdk: BlinkIDSDK.WasmSDK) {
    document.getElementById("screen-start")?.classList.add("hidden");
    document.getElementById("screen-scanning")?.classList.remove("hidden");

    // 1. Create a recognizer objects which will be used to recognize single image or stream of images.
    //

    // BlinkID Multi-side Recognizer - scan ID documents on both sides
    const multiSideGenericIDRecognizer = await BlinkIDSDK.createBlinkIdMultiSideRecognizer(sdk);

    // [OPTIONAL] Proceed with scanning the back side even if the front side result is uncertain.
    const settings = await multiSideGenericIDRecognizer.currentSettings();
    settings.allowUncertainFrontSideScan = true;
    await multiSideGenericIDRecognizer.updateSettings(settings);

    // 2. Create a RecognizerRunner object which orchestrates the recognition with one or more

    //    recognizer objects.
    const recognizerRunner = await BlinkIDSDK.createRecognizerRunner(

    // SDK instance to use
    sdk, 

    // List of recognizer objects that will be associated with created RecognizerRunner object
    [multiSideGenericIDRecognizer], 

    // [OPTIONAL] Should recognition pipeline stop as soon as first recognizer in chain finished recognition
    false);

    // 3. Prepare front side image for scan action - keep in mind that SDK can only process images represented

    //    in internal CapturedFrame data structure. Therefore, auxiliary method "captureFrame" is provided.

    // Make sure that image file is provided
    const fileFrontSide = getImageFromInput(inputImageFileFrontSide.files);
    if (!fileFrontSide) {
        alert("No image files provided!");

        // Release memory on WebAssembly heap used by the RecognizerRunner
        recognizerRunner?.delete();

        // Release memory on WebAssembly heap used by the recognizer
        multiSideGenericIDRecognizer?.delete();
        inputImageFileFrontSide.value = "";
        return;
    }
    const imageFrame = await getImageFrame(fileFrontSide);

    // 4. Start the recognition and await for the results
    const processResultFrontSide = await recognizerRunner.processImage(imageFrame);

    // 5. If recognition of the first side was successful, process the back side
    if (processResultFrontSide !== BlinkIDSDK.RecognizerResultState.Empty) {

        // 6. Prepare back side image for scan action
        const fileBackSide = getImageFromInput(inputImageFileBackSide.files);
        if (!fileBackSide) {
            alert("No image files provided!");

            // Release memory on WebAssembly heap used by the RecognizerRunner
            recognizerRunner?.delete();

            // Release memory on WebAssembly heap used by the recognizer
            multiSideGenericIDRecognizer?.delete();
            inputImageFileBackSide.value = "";
            return;
        }
        const imageFrame = await getImageFrame(fileBackSide);

        // 7. Start the recognition and await for the results
        const processResultBackSide = await recognizerRunner.processImage(imageFrame);
        if (processResultBackSide !== BlinkIDSDK.RecognizerResultState.Empty) {

            // 8. If recognition of the back side was successful, obtain the result and display it
            const results = await multiSideGenericIDRecognizer.getResult();
            if (results.state !== BlinkIDSDK.RecognizerResultState.Empty) {
                console.log("BlinkID MultiSide recognizer results", results);
                const firstName = (results.firstName.latin ||
                    results.firstName.cyrillic ||
                    results.firstName.arabic) || results.mrz.secondaryID;
                const lastName = (results.lastName.latin ||
                    results.lastName.cyrillic ||
                    results.lastName.arabic) || results.mrz.primaryID;
                const fullName = (results.fullName.latin ||
                    results.fullName.cyrillic ||
                    results.fullName.arabic) || `${results.mrz.secondaryID} ${results.mrz.primaryID}`;
                const dateOfBirth = {
                    year: results.dateOfBirth.year || results.mrz.dateOfBirth.year,
                    month: results.dateOfBirth.month || results.mrz.dateOfBirth.month,
                    day: results.dateOfBirth.day || results.mrz.dateOfBirth.day
                };
                const derivedFullName = `${firstName} ${lastName}`.trim() || fullName;
                alert(`Hello, ${derivedFullName}!\n You were born on ${dateOfBirth.year}-${dateOfBirth.month}-${dateOfBirth.day}.`);
            }
        }
        else {
            alert("Could not extract information from the back side of a document!");
        }
    }
    else {
        alert("Could not extract information from the front side of a document!");
    }

    // 9. Release all resources allocated on the WebAssembly heap and associated with camera stream

    // Release memory on WebAssembly heap used by the RecognizerRunner
    recognizerRunner?.delete();

    // Release memory on WebAssembly heap used by the recognizer
    multiSideGenericIDRecognizer?.delete();

    // Hide scanning screen and show scan button again
    inputImageFileFrontSide.value = "";
    inputImageFileBackSide.value = "";
    scanImageElement.src = "";
    document.getElementById("screen-start")?.classList.remove("hidden");
    document.getElementById("screen-scanning")?.classList.add("hidden");
}

function getImageFromInput(fileList: FileList | null): File | null {
    if (fileList === null) {
        return null;
    }
    let image = null;
    const imageRegex = RegExp(/^image\//);
    for (let i = 0; i < fileList.length; ++i) {
        if (imageRegex.exec(fileList[i].type)) {
            image = fileList[i];
        }
    }
    return image;
}

async function getImageFrame(file: File): Promise<BlinkIDSDK.CapturedFrame> {
    const imageElement = new Image();
    const url = URL.createObjectURL(file);
    imageElement.src = url;
    await imageElement.decode();
    scanImageElement.src = url;
    const imageFrame = BlinkIDSDK.captureFrame(imageElement);
    URL.revokeObjectURL(url);
    return imageFrame;
}

// Run
main();
