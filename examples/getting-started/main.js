/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

const LICENSE = ''; // go to https://developer.microblink.com/ to generate a license
import * as BlinkIDSDK from "@microblink/blinkid-in-browser-sdk";

if (BlinkIDSDK.isBrowserSupported()) {
  const loadSettings = new BlinkIDSDK.WasmSDKLoadSettings(LICENSE);
  loadSettings.engineLocation = window.location.origin + "/resources/";

  BlinkIDSDK.loadWasmModule(loadSettings).then
    (
      async (wasmSDK) => {
        const recognizer = await BlinkIDSDK.createBlinkIdSingleSideRecognizer(wasmSDK);

        const recognizerRunner = await BlinkIDSDK.createRecognizerRunner(
          wasmSDK,
          [recognizer],
          true
        );

        const cameraFeed = document.getElementById("myCameraVideoElement");
        try {
          const videoRecognizer = await BlinkIDSDK.VideoRecognizer.createVideoRecognizerFromCameraStream(
            cameraFeed,
            recognizerRunner
          );

          const processResult = await videoRecognizer.recognize();

          if (processResult !== BlinkIDSDK.RecognizerResultState.Empty) {
            const recognitionResult = await recognizer.getResult();
            console.log(recognitionResult);
          }
          else {
            console.log("Recognition was not successful!");
          }

        }
        catch (error) {
          console.error(error);
        }
      },
      (error) => {
        console.log("Error during the initialization of the SDK!", error);
      }
    )
}
else {
  console.log("This browser is not supported by the SDK!");
}