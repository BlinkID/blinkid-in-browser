
/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * This example app demonstrates how to use BlinkID In-browser SDK to achieve the following:
 *
 * - Change default SDK settings
 * - Scan front and back side of the identity document with web camera (combined experience)
 * - Provide visual feedback to the end-user during the scan
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
  let licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpJmmK1U6Yli0HpHJQc9bBI2kJqvzZsSRdQuWozTM4DsMZtiyvbTqzeFyGGty0nOHADAYYKb67DoLfKGPrAz1Cqc70dz5qRXsYtGlR3tWyKi5bK//76TxQJcGRwZE6N8Bo20cRt/7IQPMT99oGvB8Ty7BfyNJ8H4aX//OHRYq7QxAUt7PYXNY2rTuLMxjw04lq4xxmIQpVi6NWOoeDT3hnMKwmgVHp3hjGZ1/daIYeRxT87Ai4BJHoYFZk7xCbBxxVQJ/ZPVq7NP5LNM01fQP5PUk0WDGuBSRajhT/8OMz96RU6fi7RsQf6RNJIXEU/0Hcrlmp9gLYIZZcQ==";

  if (window.location.hostname === "blinkid.github.io")
  {
    licenseKey = "sRwAAAYRYmxpbmtpZC5naXRodWIuaW+qBF9hPYYlTvZbRpaEWILkqeLXWlI9oVk3/jZRXls87NFM1zLOran2+iUEBVTkL4ZRUyLzZuwo15fqpuaq66+s/ILnXCBo8grnptnMv7F20rrl8II2hpjICHdGBzM2Bv/3OhXkZhZgt5IZl0MiCN9A2wOQ0E/AfjkzRA58cQsSAFed70Iy03WhiJEK6XG6csch91Uj2lHs8LmP8AM8okaYgsj5OccgdZeEA9/i5QjZ/OrAzCrIW3ZzhlgTdW8Fa5IoUQFt6lz8SVgZUM97nxwv19wcdFM/BvFkrDAQgy28/YTgbr1kld3XbdQrkIgsoN2wmElAfsVAFhBNjQvx9Jc6wMRx";
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
  // GenericCombine ID Recognizer - scan ID documents on both sides
  const combinedGenericIDRecognizer = await BlinkIDSDK.createBlinkIdCombinedRecognizer(sdk);

  // Create a callbacks object that will receive recognition events, such as detected object location etc.
  const callbacks = {
    onQuadDetection: (quad) => drawQuad(quad),
    onDetectionFailed: () => updateScanFeedback("Detection failed", true),

    // This callback is required for combined experience.
    onFirstSideResult: () => alert("Flip the document")
  };

  // 2. Create a RecognizerRunner object which orchestrates the recognition with one or more
  //    recognizer objects.
  const recognizerRunner = await BlinkIDSDK.createRecognizerRunner(

  // SDK instance to use
  sdk,
  // List of recognizer objects that will be associated with created RecognizerRunner object
  [combinedGenericIDRecognizer],
  // [OPTIONAL] Should recognition pipeline stop as soon as first recognizer in chain finished recognition
  false,
  // Callbacks object that will receive recognition events
  callbacks);


  // 3. Create a VideoRecognizer object and attach it to HTMLVideoElement that will be used for displaying the camera feed
  const videoRecognizer = await BlinkIDSDK.VideoRecognizer.createVideoRecognizerFromCameraStream(

  cameraFeed,
  recognizerRunner);


  // 4. Start the recognition and get results from callback
  try
  {
    videoRecognizer.startRecognition(

    // 5. Obtain the results
    async (recognitionState) =>
    {
      if (!videoRecognizer)
      {
        return;
      }

      // Pause recognition before performing any async operation
      videoRecognizer.pauseRecognition();

      if (recognitionState === BlinkIDSDK.RecognizerResultState.Empty)
      {
        return;
      }

      const result = await combinedGenericIDRecognizer.getResult();

      if (result.state === BlinkIDSDK.RecognizerResultState.Empty)
      {
        return;
      }

      // Inform the user about results
      console.log("BlinkIDCombined results", result);

      const firstName = result.firstName || result.mrz.secondaryID;
      const lastName = result.lastName || result.mrz.primaryID;
      const dateOfBirth = {
        year: result.dateOfBirth.year || result.mrz.dateOfBirth.year,
        month: result.dateOfBirth.month || result.mrz.dateOfBirth.month,
        day: result.dateOfBirth.day || result.mrz.dateOfBirth.day
      };

      alert(

      `Hello, ${firstName} ${lastName}!\n You were born on ${dateOfBirth.year}-${dateOfBirth.month}-${dateOfBirth.day}.`);


      // 6. Release all resources allocated on the WebAssembly heap and associated with camera stream

      // Release browser resources associated with the camera stream
      videoRecognizer?.releaseVideoFeed();

      // Release memory on WebAssembly heap used by the RecognizerRunner
      recognizerRunner?.delete();

      // Release memory on WebAssembly heap used by the recognizer
      combinedGenericIDRecognizer?.delete();

      // Clear any leftovers drawn to canvas
      clearDrawCanvas();

      // Hide scanning screen and show scan button again
      document.getElementById("screen-start")?.classList.remove("hidden");
      document.getElementById("screen-scanning")?.classList.add("hidden");
    });

  }
  catch (error)
  {
    console.error("Error during initialization of VideoRecognizer:", error);
    return;
  }
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
