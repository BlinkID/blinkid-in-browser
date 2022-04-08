
/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * BlinkID In-browser SDK demo app which demonstrates how to:
 *
 * - Change default SDK settings
 * - Scan front side of the identity document with web camera
 * - Provide visual feedback to the end-user during the scan
 * - Extract information about success frame from which the data has been extracted
 */

// General UI helpers
const initialMessageEl = document.getElementById("msg");
const progressEl = document.getElementById("load-progress");

// UI elements for scanning feedback
const cameraFeed = document.getElementById("camera-feed");
const cameraFeedback = document.getElementById("camera-feedback");
const drawContext = cameraFeedback.getContext("2d");
const scanFeedback = document.getElementById("camera-guides");

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
    document.getElementById("start-scan")?.addEventListener("click", (ev) =>
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
  // Generic ID Recognizer - scan various ID documents
  const genericIDRecognizer = await BlinkIDSDK.createBlinkIdRecognizer(sdk);

  // 2. Wrap the recognizer with SuccessFrameGrabberRecognizer
  const genericIDRecognizerSfg = await BlinkIDSDK.createSuccessFrameGrabberRecognizer(sdk, genericIDRecognizer);

  // [OPTIONAL] Create a callbacks object that will receive recognition events, such as detected object location etc.
  const callbacks = {
    onQuadDetection: (quad) => drawQuad(quad),
    onDetectionFailed: () => updateScanFeedback("Detection failed", true) };


  // 3. Create a RecognizerRunner object which orchestrates the recognition with one or more
  //    recognizer objects.
  const recognizerRunner = await BlinkIDSDK.createRecognizerRunner(

  // SDK instance to use
  sdk,
  // List of recognizer objects that will be associated with created RecognizerRunner object
  // Important: if recognizer is wrapped with SuccessFrameGrabberRecognizer, wrapper should be
  //            provided instead of the original recognizer.
  [genericIDRecognizerSfg],
  // [OPTIONAL] Should recognition pipeline stop as soon as first recognizer in chain finished recognition
  false,
  // [OPTIONAL] Callbacks object that will receive recognition events
  callbacks);


  // 4. Create a VideoRecognizer object and attach it to HTMLVideoElement that will be used for displaying the camera feed
  const videoRecognizer = await BlinkIDSDK.VideoRecognizer.createVideoRecognizerFromCameraStream(

  cameraFeed,
  recognizerRunner);


  // 5. Start the recognition and await for the results
  const processResult = await videoRecognizer.recognize();

  // 6. If recognition was successful, obtain the result and display it
  if (processResult !== BlinkIDSDK.RecognizerResultState.Empty)
  {
    // Get BlinkIDRecognizer results
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

    // Get SuccessFrameGrabberRecognizer results for BlinkIDRecognizer
    const genericIDSfgResults = await genericIDRecognizerSfg.getResult();
    if (genericIDSfgResults.state !== BlinkIDSDK.RecognizerResultState.Empty)
    {
      console.log("Success frame for BlinkIDRecognizer", genericIDSfgResults);
    }
  } else

  {
    alert("Could not extract information!");
  }

  // 7. Release all resources allocated on the WebAssembly heap and associated with camera stream

  // Release browser resources associated with the camera stream
  videoRecognizer?.releaseVideoFeed();

  // Release memory on WebAssembly heap used by the RecognizerRunner
  recognizerRunner?.delete();

  // Release memory on WebAssembly heap used by the recognizer
  genericIDRecognizer?.delete();
  genericIDRecognizerSfg?.delete();

  // Clear any leftovers drawn to canvas
  clearDrawCanvas();

  // Hide scanning screen and show scan button again
  document.getElementById("screen-start")?.classList.remove("hidden");
  document.getElementById("screen-scanning")?.classList.add("hidden");
}

/**
 * Utility functions for drawing detected quadrilateral onto canvas.
 */
function drawQuad(quad)
{
  clearDrawCanvas();

  // Based on detection status, show appropriate color and message
  setupColor(quad);
  setupMessage(quad);

  applyTransform(quad.transformMatrix);
  drawContext.beginPath();
  drawContext.moveTo(quad.topLeft.x, quad.topLeft.y);
  drawContext.lineTo(quad.topRight.x, quad.topRight.y);
  drawContext.lineTo(quad.bottomRight.x, quad.bottomRight.y);
  drawContext.lineTo(quad.bottomLeft.x, quad.bottomLeft.y);
  drawContext.closePath();
  drawContext.stroke();
}

/**
 * This function will make sure that coordinate system associated with detectionResult
 * canvas will match the coordinate system of the image being recognized.
 */
function applyTransform(transformMatrix)
{
  const canvasAR = cameraFeedback.width / cameraFeedback.height;
  const videoAR = cameraFeed.videoWidth / cameraFeed.videoHeight;

  let xOffset = 0;
  let yOffset = 0;
  let scaledVideoHeight = 0;
  let scaledVideoWidth = 0;

  if (canvasAR > videoAR)
  {
    // pillarboxing: https://en.wikipedia.org/wiki/Pillarbox
    scaledVideoHeight = cameraFeedback.height;
    scaledVideoWidth = videoAR * scaledVideoHeight;
    xOffset = (cameraFeedback.width - scaledVideoWidth) / 2.0;
  } else

  {
    // letterboxing: https://en.wikipedia.org/wiki/Letterboxing_(filming)
    scaledVideoWidth = cameraFeedback.width;
    scaledVideoHeight = scaledVideoWidth / videoAR;
    yOffset = (cameraFeedback.height - scaledVideoHeight) / 2.0;
  }

  // first transform canvas for offset of video preview within the HTML video element (i.e. correct letterboxing or pillarboxing)
  drawContext.translate(xOffset, yOffset);
  // second, scale the canvas to fit the scaled video
  drawContext.scale(

  scaledVideoWidth / cameraFeed.videoWidth,
  scaledVideoHeight / cameraFeed.videoHeight);


  // finally, apply transformation from image coordinate system to
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
  drawContext.transform(

  transformMatrix[0],
  transformMatrix[3],
  transformMatrix[1],
  transformMatrix[4],
  transformMatrix[2],
  transformMatrix[5]);

}

function clearDrawCanvas()
{
  cameraFeedback.width = cameraFeedback.clientWidth;
  cameraFeedback.height = cameraFeedback.clientHeight;

  drawContext.clearRect(

  0,
  0,
  cameraFeedback.width,
  cameraFeedback.height);

}

function setupColor(displayable)
{
  let color = "#FFFF00FF";

  if (displayable.detectionStatus === 0)
  {
    color = "#FF0000FF";
  } else
  if (displayable.detectionStatus === 1)
  {
    color = "#00FF00FF";
  }

  drawContext.fillStyle = color;
  drawContext.strokeStyle = color;
  drawContext.lineWidth = 5;
}

function setupMessage(displayable)
{
  switch (displayable.detectionStatus) {

    case BlinkIDSDK.DetectionStatus.Fail:
      updateScanFeedback("Scanning...");
      break;
    case BlinkIDSDK.DetectionStatus.Success:
    case BlinkIDSDK.DetectionStatus.FallbackSuccess:
      updateScanFeedback("Detection successful");
      break;
    case BlinkIDSDK.DetectionStatus.CameraAtAngle:
      updateScanFeedback("Adjust the angle");
      break;
    case BlinkIDSDK.DetectionStatus.CameraTooHigh:
      updateScanFeedback("Move document closer");
      break;
    case BlinkIDSDK.DetectionStatus.CameraTooNear:
    case BlinkIDSDK.DetectionStatus.DocumentTooCloseToEdge:
    case BlinkIDSDK.DetectionStatus.Partial:
      updateScanFeedback("Move document farther");
      break;
    default:
      console.warn("Unhandled detection status!", displayable.detectionStatus);}

}

let scanFeedbackLock = false;

/**
 * The purpose of this function is to ensure that scan feedback message is
 * visible for at least 1 second.
 */
function updateScanFeedback(message, force)
{
  if (scanFeedbackLock && !force)
  {
    return;
  }

  scanFeedbackLock = true;
  scanFeedback.innerText = message;

  window.setTimeout(() => scanFeedbackLock = false, 1000);
}

// Run
main();
