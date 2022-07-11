
/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * This example app demonstrates how to use BlinkID In-browser SDK to achieve the following:
 *
 * - Change default SDK settings
 * - Scan front and back side of the identity document with file upload (combined experience)
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
  let licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpJmmLi09YgqofAWQB52tAld2L4R8rZLtBi6k8QiLmeCcU5QEIHsyJ63k/sQmghiGt2eIAkaaSabK83Wxgn7F5zb5SN73FyYFMea8efbvyazf5VN9P+pm8sXlXGu8N0GFDuq8aoy+962L8Pxqc8oOt8UlnEQidYRuIZ3l+rlTkJA92179iAsFPT3ofxHOr9lFWBqqHSenGmK6IyjaPaHgbh1PvKRoQPPBlg4n5jxS9HSd4yHsu6HXsD4EsSD/nAhFPmfNK9wWO5/J+MiXSuwJwP7x6LyobgeLGoWUuUVVwWte1eQjVk9dvpdiTTk5u12uEhJiYxQX/tv+DQ==";

  if (window.location.hostname === "blinkid.github.io")
  {
    licenseKey = "sRwAAAYRYmxpbmtpZC5naXRodWIuaW+qBF9hPYYlTvZbRpaBIIXkqyVaTCqJEO4gCuVUB2iHeZpc7FkFUfuMbReRp/+7s6ZfXoxfHG/jvipsbaZNMQ4yID/m3wugcbnqiCNRxpYugu7MuYKl1bV24WEbb1pUmyGPj0o350NBAX5nbasfMlYNqypjT7Jk+nSEejNsZ/PZQPBNSAboZzZZYG6UOkN2NqGL+GzX6PH72JhuGgHQfuJQzWWQnVDPHOjUCa8frHM0rYi3wXLFys3iVqVeSY7ixcwo24zVbJwXg4gkffrSiaU8E8Rxq8wwXWR7JmfaZNR1P8DG1zZf5Gef03jZpkgV2D8J/2y2lcvJIEjwopCrte/+Yahr";
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
  });

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
  // GenericCombine ID Recognizer - scan ID documents on both sides
  const combinedGenericIDRecognizer = await BlinkIDSDK.createBlinkIdCombinedRecognizer(sdk);

  // [OPTIONAL] Proceed with scanning the back side even if the front side result is uncertain.
  const settings = await combinedGenericIDRecognizer.currentSettings();
  settings.allowUncertainFrontSideScan = true;
  await combinedGenericIDRecognizer.updateSettings(settings);

  // 2. Create a RecognizerRunner object which orchestrates the recognition with one or more
  //    recognizer objects.
  const recognizerRunner = await BlinkIDSDK.createRecognizerRunner(

  // SDK instance to use
  sdk,
  // List of recognizer objects that will be associated with created RecognizerRunner object
  [combinedGenericIDRecognizer],
  // [OPTIONAL] Should recognition pipeline stop as soon as first recognizer in chain finished recognition
  false);


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
    combinedGenericIDRecognizer?.delete();
    inputImageFileFrontSide.value = "";
    return;
  }

  const imageFrame = await getImageFrame(fileFrontSide);

  // 4. Start the recognition and await for the results
  const processResultFrontSide = await recognizerRunner.processImage(imageFrame);

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
      combinedGenericIDRecognizer?.delete();
      inputImageFileBackSide.value = "";
      return;
    }

    const imageFrame = await getImageFrame(fileBackSide);

    // 7. Start the recognition and await for the results
    const processResultBackSide = await recognizerRunner.processImage(imageFrame);

    if (processResultBackSide !== BlinkIDSDK.RecognizerResultState.Empty)
    {
      // 8. If recognition of the back side was successful, obtain the result and display it
      const results = await combinedGenericIDRecognizer.getResult();
      if (results.state !== BlinkIDSDK.RecognizerResultState.Empty)
      {
        console.log("BlinkIDCombined results", results);

        const firstName = results.firstName || results.mrz.secondaryID;
        const lastName = results.lastName || results.mrz.primaryID;
        const dateOfBirth = {
          year: results.dateOfBirth.year || results.mrz.dateOfBirth.year,
          month: results.dateOfBirth.month || results.mrz.dateOfBirth.month,
          day: results.dateOfBirth.day || results.mrz.dateOfBirth.day };


        alert(

        `Hello, ${firstName} ${lastName}!\n You were born on ${dateOfBirth.year}-${dateOfBirth.month}-${dateOfBirth.day}.`);

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
  combinedGenericIDRecognizer?.delete();

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
  scanImageElement.src = URL.createObjectURL(file);
  await scanImageElement.decode();
  return BlinkIDSDK.captureFrame(scanImageElement);
}

// Run
main();
