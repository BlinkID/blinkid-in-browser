
/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * BlinkID In-browser SDK demo app which demonstrates how to:
 *
 * - Change default SDK settings
 * - Scan front side of the identity document from image
 * - Provide visual feedback to the end-user during the scan
 */

// General UI helpers
const initialMessageEl = document.getElementById("msg");
const progressEl = document.getElementById("load-progress");
const scanImageElement = document.getElementById("target-image");
const inputImageFile = document.getElementById("image-file");

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
  let licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpJlWLms+Z2+bPv3qQKWQwSGu5HWQtiGmj3Qh0Vmmq3mSRGKjWqjOkTNrZR2cPKNa2sUNaN6YJOzq9suQCCrHGQHKiu1Pof8Mi65YfgPFCORAPlDRzFFIHhAsmc40yqk1PzLFaJFO4A9cBEGjyx0iCxIhBaSWBTN99L/sqXkdL+mJyS25rQ4PSHBZPMh9XN+0pf27BJ2xIEgOaIZJAo2fh3s6w0sj7qOS0RghqXxggFKmr5M9mz/q3x/01sZhhxKOGT+vxrtvC2/RuBRtzalC4zZPoQVxZjdCixLT2hClaCe7srqSc+nuNxrMQZ5A1Ghl9c4=";

  if (window.location.hostname === "blinkid.github.io")
  {
    licenseKey = "sRwAAAYRYmxpbmtpZC5naXRodWIuaW+qBF9hPYYlTvZbRmaBZobhpCRHTpeFbak25lj9/gkMYK3Ch8K+TaVXALI8cccegrK/p5qXImpKgFXkD39HBpI1zUKVmdVFsccUdxeXLQ0vE71ZKwxOZvKtsX7i79ewHvtNC0+St0iKxur/ucw/e7K4EpBjpHeA2DzpN+HuVDgxZ7i2r7aQ+GhX29cqPQSLeVHXBGjxLEBqj/nOFii78SGWl5yfvBeQP+1w8eKDI6HlguOFI5ZDfR0EfrfQOFtCeIikbfvVWvHtxGump6hgTqtifd8KcfIekce56WDw17Vf11852hntlsYgLWCYNriWPYsbaXEYNCUeknoG2w==";
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
      document.getElementById("image-file")?.addEventListener("change", (ev) =>
      {
        ev.preventDefault();
        startScan(sdk, ev.target.files);
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
async function startScan(sdk, fileList)
{
  document.getElementById("screen-start")?.classList.add("hidden");
  document.getElementById("screen-scanning")?.classList.remove("hidden");

  // 1. Create a recognizer objects which will be used to recognize single image or stream of images.
  //
  // BlinkID Single-side Recognizer - scan various ID documents
  const singleSideIDRecognizer = await BlinkIDSDK.createBlinkIdSingleSideRecognizer(sdk);

  // 2. Create a RecognizerRunner object which orchestrates the recognition with one or more
  //    recognizer objects.
  const recognizerRunner = await BlinkIDSDK.createRecognizerRunner(

    // SDK instance to use
    sdk,
    // List of recognizer objects that will be associated with created RecognizerRunner object
    [singleSideIDRecognizer],
    // [OPTIONAL] Should recognition pipeline stop as soon as first recognizer in chain finished recognition
    false
  );

  // 3. Prepare image for scan action - keep in mind that SDK can only process images represented in
  //    internal CapturedFrame data structure. Therefore, auxiliary method "captureFrame" is provided.

  // Make sure that image file is provided
  let file = null;
  const imageRegex = RegExp(/^image\//);
  for (let i = 0; i < fileList.length; ++i)
  {
    if (imageRegex.exec(fileList[i].type))
    {
      file = fileList[i];
    }
  }
  if (!file)
  {
    alert("No image files provided!");
    // Release memory on WebAssembly heap used by the RecognizerRunner
    recognizerRunner?.delete();

    // Release memory on WebAssembly heap used by the recognizer
    singleSideIDRecognizer?.delete();
    inputImageFile.value = "";
    return;
  }
  const imageElement = new Image();
  const url = URL.createObjectURL(file);

  imageElement.src = url;
  scanImageElement.src = url;

  await imageElement.decode();
  const imageFrame = BlinkIDSDK.captureFrame(imageElement);
  URL.revokeObjectURL(url);

  // 4. Start the recognition and await for the results
  const processResult = await recognizerRunner.processImage(imageFrame);

  // 5. If recognition was successful, obtain the result and display it
  if (processResult !== BlinkIDSDK.RecognizerResultState.Empty)
  {
    const singleSideIDResults = await singleSideIDRecognizer.getResult();
    if (singleSideIDResults.state !== BlinkIDSDK.RecognizerResultState.Empty)
    {
      console.log("BlinkID Single-side recognizer results", singleSideIDResults);

      const firstName =
      singleSideIDResults.firstName.latin ||
      singleSideIDResults.firstName.cyrillic ||
      singleSideIDResults.firstName.arabic ||
      singleSideIDResults.mrz.secondaryID;

      const lastName =
      singleSideIDResults.lastName.latin ||
      singleSideIDResults.lastName.cyrillic ||
      singleSideIDResults.lastName.arabic ||
      singleSideIDResults.mrz.primaryID;

      const dateOfBirth = {
        year: singleSideIDResults.dateOfBirth.year || singleSideIDResults.mrz.dateOfBirth.year,
        month: singleSideIDResults.dateOfBirth.month || singleSideIDResults.mrz.dateOfBirth.month,
        day: singleSideIDResults.dateOfBirth.day || singleSideIDResults.mrz.dateOfBirth.day
      };

      const fullName =
      singleSideIDResults.fullName.latin ||
      singleSideIDResults.fullName.cyrillic ||
      singleSideIDResults.fullName.arabic ||
      `${singleSideIDResults.mrz.secondaryID} ${singleSideIDResults.mrz.primaryID}`;

      const derivedFullName = `${firstName} ${lastName}`.trim() || fullName;

      alert(

        `Hello, ${derivedFullName}!\n You were born on ${dateOfBirth.year}-${dateOfBirth.month}-${dateOfBirth.day}.`
      );
    }
  } else

  {
    alert("Could not extract information!");
  }

  // 7. Release all resources allocated on the WebAssembly heap and associated with camera stream

  // Release memory on WebAssembly heap used by the RecognizerRunner
  recognizerRunner?.delete();

  // Release memory on WebAssembly heap used by the recognizer
  singleSideIDRecognizer?.delete();

  // Hide scanning screen and show scan button again
  inputImageFile.value = "";
  scanImageElement.src = "";
  document.getElementById("screen-start")?.classList.remove("hidden");
  document.getElementById("screen-scanning")?.classList.add("hidden");
}

// Run
main();
