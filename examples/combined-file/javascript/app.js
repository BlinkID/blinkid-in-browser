
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
  let licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpJmmLi04YvSyT5sLzoao9hcCwO9Q460/aTFvrZVzOupKLv+IHP1PZAfZVqhEw86GxUM2iebY5IhDZ0V8LMBe6jhUG9RP0DXQS45U4e5y3fbcxwC9ywZH4HU1Z/esUyfzRBIHJtmpg3m0CqqxPBhT0ZcDrlLOvvHI1V8IM0FsLYdljjsjZuUlxPWWV5XZpCh9LPHZvCVKWvFANopemXIHdVO7Zi+nBcDXsL2eXjtGB84EbccvktWXB6ShjUixJ0h8rIAVNcIdgKM8TJvfcknoj7BwhlnUnCFMwY7baJ/YLkxVnoZPiK/lJ6DAiunZ9y1JLHZ7z0Ualne7cg==";

  if (window.location.hostname === "blinkid.github.io")
  {
    licenseKey = "sRwAAAYRYmxpbmtpZC5naXRodWIuaW+qBF9hPYYlTvZbRpaBIIDkCE4HJ94O33dMQ14Xh0jRHxWmjLbh0US8wo6AbRlj4fL95SnNVo1CX25E43EDRRXUcLV9X6tf9CZfRHEB8BNwW3zNSZ06WtW27RlB/7GpX1nZPOO0f0I5kpAKmPlT8ixjmGAIEh86wuP9LzNp8J3E3iTZ5TcJaqq8RqWV1yrZeCIsHd93TL0xx84ArMqBUYr1esGFcqDQcYl0bip9JEH0r/GRm/5hrEwml7OjZX1QbKRfvV5gtsFtoZW9kxj4pTKiCQDgO/05M1xZ/DvOD3W3O3vfAPIZkFOAuIOmdejywrCsMozTeWrbBvRBdAsf+B06ygM7";
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
