
/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * This example app demonstrates how to use BlinkID In-browser SDK to achieve the following:
 *
 * - Change default SDK settings
 * - Scan front and back side of the identity document with file upload (multi-side experience)
 */

// General UI helpers
const initialMessageEl = document.getElementById("msg");
const progressEl = document.getElementById("load-progress");
const scanImageElement = document.getElementById("target-image");
const inputImageFileFrontSide = document.getElementById("image-file-front-side");
const inputImageFileBackSide = document.getElementById("image-file-back-side");

/**
 * Check browser support, customize settings and load WASM SDK.
 */
function main()
{
  // Check if browser has proper support for WebAssembly
  if (!BlinkIDSDK.isBrowserSupported())
  {
    initialMessageEl.innerText = "This browser is not supported!";
    return;
  }

  // 1. It's possible to obtain a free trial license key on microblink.com
  let licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpJnWL5M+YcNOLCZpQAPti9/EUHPSEzmVcZEKIllbsFxfBL4e2kxrtWauDEOSyT4D+KQxVWPSjxBX8VCozoanZDJyCZzHgLpqjG9Aed0bLri1pvVGMJ1Zn0QD3SAt8g/NGsBQdfxEekYqFqRTejBKdr1m7ooVgyfR6uT8xfOCkOmO5xWwl7VxZfWp5NaSl9rsISvTH9WK1DtM/wVekRMxDILWZi4sKcbvaUv8MUnYfSQGe9fVLK5apaCsS87ZrGWMSbAp+7WVMVKPMhhHKn4LNmuMCqGrAKw3iVe4JtT2pdii1L9gYYUQgNaodGjc9PWpvik=";

  if (window.location.hostname === "blinkid.github.io")
  {
    licenseKey = "sRwAAAYRYmxpbmtpZC5naXRodWIuaW+qBF9hPYYlTvZbRuaAnobn1fs90GPH3XI6gKMQRFi6NYzBMdEsDKk3YJyZzJ0f5cxM3VOY4nw01n5moYEGSGdyy4LhsF6BrfI8eJhByoxO7+zRrPxRj7CwBpNm/t77VCrabWanogzWn06MyeV+HdrF7Cpd2cfqKW1jhNNe86GHEP7m7StcFf10I6htKvXbNuyLA8DIBt9JnTAANc5gdF/KDuP+lR4IqOPrMmQ4Y0XPoGAWpt/qWuXjqSR7dXqNbPl6tCz4aJ20YdBS1uRhSSxrqyun1bYLCNFo9RpLdKr3SXhHpBGWeukEd0FdvqRK/u5bIlzN3gSb8uzbtg==";
  }

  // 2. Create instance of SDK load settings with your license key
  const loadSettings = new BlinkIDSDK.WasmSDKLoadSettings(licenseKey);

  // [OPTIONAL] Change default settings

  // Show or hide hello message in browser console when WASM is successfully loaded
  loadSettings.allowHelloMessage = true;

  // In order to provide better UX, display progress bar while loading the SDK
  loadSettings.loadProgressCallback = (progress) => progressEl.value = progress;

  // Set absolute location of the engine, i.e. WASM and support JS files
  loadSettings.engineLocation = "https://blinkid.github.io/blinkid-in-browser/resources";

  // Set absolute location of the worker file
  loadSettings.workerLocation = "https://blinkid.github.io/blinkid-in-browser/resources/BlinkIDWasmSDK.worker.min.js";

  // 3. Load SDK
  BlinkIDSDK.loadWasmModule(loadSettings).then(

    (sdk) =>
    {
      document.getElementById("screen-initial")?.classList.add("hidden");
      document.getElementById("screen-start")?.classList.remove("hidden");
      document.getElementById("start-button")?.addEventListener("click", (ev) =>
      {
        ev.preventDefault();
        startScan(sdk);
      });
    },
    (error) =>
    {
      initialMessageEl.innerText = "Failed to load SDK!";
      console.error("Failed to load SDK!", error);
    }
  );
}

/**
 * Scan single side of identity document with web camera.
 */
async function startScan(sdk)
{
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
    false
  );

  // 3. Prepare front side image for scan action - keep in mind that SDK can only process images represented
  //    in internal CapturedFrame data structure. Therefore, auxiliary method "captureFrame" is provided.

  // Make sure that image file is provided
  const fileFrontSide = getImageFromInput(inputImageFileFrontSide.files);

  if (!fileFrontSide)
  {
    alert("No image files provided!");
    // Release memory on WebAssembly heap used by the RecognizerRunner
    recognizerRunner?.delete();

    // Release memory on WebAssembly heap used by the recognizer
    multiSideGenericIDRecognizer?.delete();
    inputImageFileFrontSide.value = "";
    return;
  }

  const frontImageFrame = await getImageFrame(fileFrontSide);

  // 4. Start the recognition and await for the results
  const processResultFrontSide = await recognizerRunner.processImage(frontImageFrame);

  // 5. If recognition of the first side was successful, process the back side
  if (processResultFrontSide !== BlinkIDSDK.RecognizerResultState.Empty)
  {
    // 6. Prepare back side image for scan action
    const fileBackSide = getImageFromInput(inputImageFileBackSide.files);

    if (!fileBackSide)
    {
      alert("No image files provided!");
      // Release memory on WebAssembly heap used by the RecognizerRunner
      recognizerRunner?.delete();

      // Release memory on WebAssembly heap used by the recognizer
      multiSideGenericIDRecognizer?.delete();
      inputImageFileBackSide.value = "";
      return;
    }

    const backImageFrame = await getImageFrame(fileBackSide);

    // 7. Start the recognition and await for the results
    const processResultBackSide = await recognizerRunner.processImage(backImageFrame);

    if (processResultBackSide !== BlinkIDSDK.RecognizerResultState.Empty)
    {
      // 8. If recognition of the back side was successful, obtain the result and display it
      const results = await multiSideGenericIDRecognizer.getResult();

      if (results.state !== BlinkIDSDK.RecognizerResultState.Empty)
      {
        console.log("BlinkID MultiSide recognizer results", results);

        const firstName =
        results.firstName.latin ||
        results.firstName.cyrillic ||
        results.firstName.arabic ||
        results.mrz.secondaryID;

        const lastName =
        results.lastName.latin ||
        results.lastName.cyrillic ||
        results.lastName.arabic ||
        results.mrz.primaryID;

        const fullName =
        results.fullName.latin ||
        results.fullName.cyrillic ||
        results.fullName.arabic ||
        `${results.mrz.secondaryID} ${results.mrz.primaryID}`;

        const dateOfBirth = {
          year: results.dateOfBirth.year || results.mrz.dateOfBirth.year,
          month: results.dateOfBirth.month || results.mrz.dateOfBirth.month,
          day: results.dateOfBirth.day || results.mrz.dateOfBirth.day
        };

        const derivedFullName = `${firstName} ${lastName}`.trim() || fullName;

        alert(

          `Hello, ${derivedFullName}!\n You were born on ${dateOfBirth.year}-${dateOfBirth.month}-${dateOfBirth.day}.`
        );
      }
    } else

    {
      alert("Could not extract information from the back side of a document!");
    }
  } else

  {
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

function getImageFromInput(fileList) {
  let image = null;
  const imageRegex = RegExp(/^image\//);
  for (let i = 0; i < fileList.length; ++i)
  {
    if (imageRegex.exec(fileList[i].type))
    {
      image = fileList[i];
    }
  }
  return image;
}

async function getImageFrame(file) {
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
