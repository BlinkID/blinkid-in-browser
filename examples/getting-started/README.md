# Integrating ID Scanning and Extraction In Web Apps With BlinkID SDK

## How to run this repo?
Test this repo out in under a minute on your machine (if you have Node and Git installed) by doing the following steps:
- in your terminal, clone [this](https://github.com/BlinkID/blinkid-in-browser) repo with `git clone https://github.com/BlinkID/blinkid-in-browser`
- get the license at [Microblink DevHub](https://developer.microblink.com/) and add it to the `LICENSE` variable in the `main.js` file
- run `cd BlinkID-InBrowserSDK-GettingStarted && npm install && npm run dev`
- open [http://localhost:5173/](http://localhost:5173/) and point your ID towards the camera

If you prefer a short video for running this project, feel free to check it out [here](https://www.youtube.com/watch?v=c0ZA8af9oBc).

If you want to recreate this project from scratch, here's the step by step guide...

## TL;DR
In this step-by-step tutorial, we'll show you how to start scanning and extracting the data from a driver's license using Microblink's BlinkID SDK.

If you're pressed for time, and want to see this work in action right away, check out the demo: [https://microblink.com/demo/](https://microblink.com/demo/). Or, as mentioned above, run it by yourself locally.

## The Problem
Let's set the stage: you're running a car rental business, and your customers have to enter their driver license information in a web form on your website. This process is usually error prone, and often takes a while, and you observe a steep dropoff rate on this particular screen. 

You dig deeper with your product and user research teams and find out that people often make mistakes entering the information and that they, in general, find the process cumbersome.

Now, imagine this: you implement a library that enables you to offer customers the ability to just scan their ID with their camera, and woila: you automatically fill out all the details from their ID.

Seamless, errorless, and fast!

Intrigued? OK, let's go through a step by step process in getting started with this.

> In general, integrating advanced document scanning and OCR capabilities into your web application can significantly enhance user experience and streamline processes no matter the industry. Microblink's BlinkID SDK offers robust and reliable solutions for scanning not only driver's licenses, but also IDs, passports, and other documents. In this blog post, I'll guide you through the steps to integrate BlinkID into your web app for extracting data from a driver's license, and we'll dig deeper in other solutions in some other posts.

## Prerequisites
Make sure that you have the following tools installed:
- Node.js – go to the [main website](https://nodejs.org/en) and download the executable for your machine
- Git – go to the [main website](https://git-scm.com/downloads) and download the executable for your machine

## Starting a new project with Vite
As you can see in the latest [State of JS report](https://2023.stateofjs.com/en-US/libraries/build_tools/), [Vite](https://vitejs.dev/) has become one of the most belowed build tools, so we'll use it here.

In case you're wondering why that is even important, then a very long explanation is [here](https://vitejs.dev/guide/why.html#the-problems), and a very quick, but mouthfull, answer is that:
>Vite leverages native ES modules to provide a fast development server with instant Hot Module Replacement (HMR), making development smoother and more efficient, and produces optimized, production-ready builds.

To put it bluntly, you shouldn't use Vite because the cool kids are using it, but because it'll actually make your dev experience way better.

OK, with theory out of the way, let's run the following command in your terminal: `npm create vite@latest`. This will run the latest version of Vite.

When prompted, use `blinkid-integration` as the Project name, select `Vanilla` as framework (meaning, no framework) and `Javascript` as the variant (meaning, the language; other option is TypeScript). The output you should see is similar to this:

```
✔ Project name: … blinkid-integration
✔ Select a framework: › Vanilla
✔ Select a variant: › JavaScript

Scaffolding project in /Users/nikola/DEV/test-vite/blinkid-integration...

Done. Now run:

  cd blinkid-integration
  npm install
  npm run dev
```

## Running our scaffolded project
Let’s run the commands (in terminal) noted at the end of the previous output:

```bash
cd blinkid-integration
npm install
npm run dev
```

Once this finishes, you should get an output similar to this:

```bash
added 10 packages, and audited 11 packages in 10s

3 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

> blinkid-integration@0.0.0 dev
> vite

Port 5173 is in use, trying another one...

  VITE v5.3.2  ready in 209 ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

You should see the following page in your browser if you open http://localhost:5174:

![](https://i.imgur.com/R1wAXrK.png)

As expected, if you click on the `count is 0` button, the number will increase. 

## Adding BlinkID SDK

Next, let's install the BlinkID SDK by running the following code in the terminal:

`npm install --save @microblink/blinkid-in-browser-sdk`

## Copying the resources folder
This is a **very important step**, that often gets overlooked! So, please make sure to copy the `resources` folder (`found in node_modules/@microblink/blinkid-in-browser-sdk/resources`) into the `public` folder.

## Creating a basic HTML Structure
If you open the scafolded project in your favorite editor (I'm using VSCode), you'll see this folder structure:

![](https://i.imgur.com/rLHmqyW.png)

If you're interested and haven't used Vite before, I encourage you to check out the code. It showcases the ability to use the `import` command.

Now, let's replace the current contents of the `index.html` file with the following:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BlinkID Test</title>
  </head>
  <body>
    <video id="myCameraVideoElement"></video>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

You will notice that we only changed the `title`, and instead of `<div id="app"></div>` added `<video id="myCameraVideoElement"></video>`.

## Adding JavaScript for document scanning and extraction
Replace all the contents of `main.js` file with the following code:

```javascript
const LICENSE = '';
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
          console.log(processResult);

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
```

Now, let's understand what this code is doing...

```javascript
const LICENSE = '';
import * as BlinkIDSDK from "@microblink/blinkid-in-browser-sdk";

if (BlinkIDSDK.isBrowserSupported()) {
```

Line by line:
- we defined a constant called `LICENSE` (we'll tackle this in the next section)
- imported all the exported members from the `@microblink/blinkid-in-browser-sdk` package, and assigned them to the `BlinkIDSDK` object
- checked if the current browser is supported by the BlinkID SDK (you can see the list of supported browsers in our [documentation](https://github.com/BlinkID/blinkid-in-browser?tab=readme-ov-file#-supported-browsers))

```javascript
const loadSettings = new BlinkIDSDK.WasmSDKLoadSettings(LICENSE);
loadSettings.engineLocation = window.location.origin + "/resources/";
```

Line by line:
- created a new instance of `WasmSDKLoadSettings`, passing the `LICENSE` constant
  - This object holds the configuration settings for loading the WebAssembly (WASM) module of the SDK. You can read more about it [here](https://github.com/BlinkID/blinkid-in-browser?tab=readme-ov-file#wasm-resources).
- set the location where the WASM engine files are hosted. As you may remember from the `Copying the resources folder` step, we copied the `resources` folder to the `public` folder, and we need to indicate that specifically
  - if you'd copy/paste the actual content of the `resources` folder into the `public` folder, then you wouldn't need to set this specifically
- called the `loadWasmModule` method to load the WASM module with the specified settings.
  - this method returns a promise, and once it resolves succesfully, the asynchronous callback function is executed, exposing the `wasmSDK` variable

```javascript
const recognizer = await BlinkIDSDK.createBlinkIdSingleSideRecognizer(wasmSDK);
const recognizerRunner = await BlinkIDSDK.createRecognizerRunner(
    wasmSDK,
    [recognizer],
    true
);
```

Line by line:
- created an instance of `BlinkIdSingleSideRecognizer`
- created a `RecognizerRunner` instance which manages the recognition process
  - it takes the Wasm SDK instance, an array of recognizers, and a boolean flag indicating whether the recognizer should allow multiple results or not (read more about it [here](https://github.com/BlinkID/blinkid-in-browser?tab=readme-ov-file#-recognizerrunner))

```javascript
const cameraFeed = document.getElementById("myCameraVideoElement");
const videoRecognizer = await BlinkIDSDK.VideoRecognizer.createVideoRecognizerFromCameraStream(
    cameraFeed,
    recognizerRunner
);
```

Line by line:
- selected the video element from the DOM which will be used to display the camera feed
- in a `try/catch` block we created a `VideoRecognizer` instance from the camera stream using the selected video element (`cameraFeed`) and the recognizer runner (`recognizerRunner`)

```javascript
const processResult = await videoRecognizer.recognize();
console.log(processResult);

if (processResult !== BlinkIDSDK.RecognizerResultState.Empty) {
    const recognitionResult = await recognizer.getResult();
    console.log(recognitionResult);
}
else {
    console.log("Recognition was not successful!");
}
```

Line by line:
- started the recognition process and logged the result to the console
- checked if the process result is not empty, then waited for the results from the recognizer and logged them in the console
- if process result is empty, we log the appropriate message

Finally, we catch any errors from the `try/catch` and promise.

## Testing the integration - take #1
If you open the `index.html` file in a web browser, you'll see and error, something along the lines of:

```javascript
Uncaught Error
    at new WasmSDKLoadSettings (@microblink_blinkid-in-browser-sdk.js?v=1a0eef98:1868:13)
    at main.js:5:24
```

This is because we haven't defined the license in the `LICENSE` variable.

## Getting the license
To fix this, we need to go to https://login.microblink.com/ to create an account in Developer Hub. Scroll down to the Start your free trial section and you'll be prompted with the standard signup form:

![](https://i.imgur.com/f5W8Qko.png)

You'll be asked a few question that you can skip (if you're a dev, PM, etc 🙂):

![](https://i.imgur.com/cu0C74a.png)

and also get a confirmation email:

![](https://i.imgur.com/gwaEAyi.png)

Once you sign in, you'll see a dashboard like this:

![](https://i.imgur.com/7MIYUV8.png)

Here you should click on the `Start New Trial` button, and in the following screen select `BlinkID` as the product, `InBrowser` as the platform, and `localhost` as the domain name for the testing environment. Before going into production, you should update the domain name to your actual domain.

![](https://i.imgur.com/l0CsJ51.png)

Then you'll get to a screen like this, where you can copy the code (it'll be a long, so-called Base64, string of numbers and letters):

![](https://i.imgur.com/ae0LV0o.png)

Paste this code into the `LICENSE` variable in the `main.js` file, and we'll be all set.

BTW, if you're curious, BlinkID is available for lots of platforms:

![](https://i.imgur.com/vXhYuMG.png)


## Testing the integration - take #2
If you open the `index.html` file in your browser again, you'll be presented with a camera feed where you should show some ID. I Googled [US driver's license example](https://www.google.com/search?q=US+driver%27s+license+example) and took the first image on the results page and printed it out.

Then if you show this image to the camera it will dump of all the available data in the console log:

![](https://i.imgur.com/Npny7Cg.png)

## Conclusion
Integrating the BlinkID SDK into your web application is a straightforward process that can significantly enhance your app's onboarding/processing capabilities.

By following these steps, you can quickly set up document scanning and OCR functionalities to extract data from driver's licenses, improving both user experience and efficiency.

## For those who want to learn more
This was a barebones example just to get you started quickly.

Now, if you wish to learn more, you can check out the official [repo on Github](https://github.com/BlinkID/blinkid-in-browser?tab=readme-ov-file#-supported-browsers), and you can also try to add some modifications yourself, like:
- styling
  - enhance the HTML with CSS to make the interface more user-friendly
- error handling and feedback
  - add better error handling and provide better feedback to users
- extend functionality
  - explore BlinkID SDK features and enhance your application's capabilities

If you have any issues running this repo, or any other questions, please feel free to leave them in the comments.
