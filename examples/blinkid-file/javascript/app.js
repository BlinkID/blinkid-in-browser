
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
  let licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpJmmKuUfwQG/M5Aj/R/sm+fLC7g5KdrAq5kOnlCofVNmuVNwcKixzd94de+TeJ+axIkYPHkuwu7sPafUS+Fd7spSoorLOSEEALV5b0DE4Hbwr4uUB750tA+oB9yK2VQkCAhD1VRaAaCB5fdsGBnY747McuwO+qLYpAk4mejM0ZVycrJRwEIub+jLC43EboCF6h60WLHem+CAtoK28q5yFh8lCm5JcoSJOMdU3BQULVHHTu5/H8dj3PR6/S2IbHz3Ew+l29pdNgMBIDZqm3NgvW9ziWqPXhdlavTQNdpz/u03Tresx+WiustrhYKBtaEIK5opX4TDcE4=";

  if (window.location.hostname === "blinkid.github.io")
  {
    licenseKey = "sRwAAAYRYmxpbmtpZC5naXRodWIuaW+qBF9hPYYlTvZbRpaF6KdHWhhjvGmrBJ9n/dMGaVEc4Z7e9GCi2VaKg/OjDGR9QvvwD1x8fODvvtrTwyP+BkhCaB6Np3JIfsxlzHGuqYCt8VPbn7ew3nzDlOAOGpIQXxg7hUyEjMw4/UzSz+QKp1LM7HC35av13mKo7Zfi89w+r8BLs2HNy0M8FRZd3Md1wXCX69dvwMRcH4tWIoIKUVulpqs1024SyDPp/G6iFOwcFVUv9N0hap92vaP/uf2Zc5Xh4rnoENterdBRxPNaf3u0wEE8K4mgQdkkU/uuAFSi7JHL6PG2I3vnQ3paEIplOEazonFZXzqlWsvAEs8g8+Tn+Q==";
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
  });

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
  // Generic ID Recognizer - scan various ID documents
  const genericIDRecognizer = await BlinkIDSDK.createBlinkIdRecognizer(sdk);

  // 2. Create a RecognizerRunner object which orchestrates the recognition with one or more
  //    recognizer objects.
  const recognizerRunner = await BlinkIDSDK.createRecognizerRunner(

  // SDK instance to use
  sdk,
  // List of recognizer objects that will be associated with created RecognizerRunner object
  [genericIDRecognizer],
  // [OPTIONAL] Should recognition pipeline stop as soon as first recognizer in chain finished recognition
  false);


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
    genericIDRecognizer?.delete();
    inputImageFile.value = "";
    return;
  }

  scanImageElement.src = URL.createObjectURL(file);
  await scanImageElement.decode();
  const imageFrame = BlinkIDSDK.captureFrame(scanImageElement);

  // 4. Start the recognition and await for the results
  const processResult = await recognizerRunner.processImage(imageFrame);

  // 5. If recognition was successful, obtain the result and display it
  if (processResult !== BlinkIDSDK.RecognizerResultState.Empty)
  {
    const genericIDResults = await genericIDRecognizer.getResult();
    if (genericIDResults.state !== BlinkIDSDK.RecognizerResultState.Empty)
    {
      console.log("BlinkIDGeneric results", genericIDResults);

      const firstName = genericIDResults.firstName || genericIDResults.mrz.secondaryID;
      const lastName = genericIDResults.lastName || genericIDResults.mrz.primaryID;
      const dateOfBirth = {
        year: genericIDResults.dateOfBirth.year || genericIDResults.mrz.dateOfBirth.year,
        month: genericIDResults.dateOfBirth.month || genericIDResults.mrz.dateOfBirth.month,
        day: genericIDResults.dateOfBirth.day || genericIDResults.mrz.dateOfBirth.day };


      alert(

      `Hello, ${firstName} ${lastName}!\n You were born on ${dateOfBirth.year}-${dateOfBirth.month}-${dateOfBirth.day}.`);

    }
  } else

  {
    alert("Could not extract information!");
  }

  // 7. Release all resources allocated on the WebAssembly heap and associated with camera stream

  // Release memory on WebAssembly heap used by the RecognizerRunner
  recognizerRunner?.delete();

  // Release memory on WebAssembly heap used by the recognizer
  genericIDRecognizer?.delete();

  // Hide scanning screen and show scan button again
  inputImageFile.value = "";
  scanImageElement.src = "";
  document.getElementById("screen-start")?.classList.remove("hidden");
  document.getElementById("screen-scanning")?.classList.add("hidden");
}

// Run
main();
