# BlinkID In-browser SDK

## How to run this repo?

Test this repo quickly on your machine (assuming you have Node and Git installed) by doing the following steps:

-   clone [this](https://github.com/BlinkID/blinkid-in-browser) repo by running `git clone https://github.com/BlinkID/blinkid-in-browser` in your Terminal
-   run `cd blinkid-in-browser/examples/getting-started && npm install && npm run dev`
-   get the license at [Microblink DevHub](https://developer.microblink.com/) and add it to the `LICENSE` variable in the `main.js` file in the `examples/getting-started` folder
-   open [http://localhost:5173/](http://localhost:5173/)
    -   port may be different in your case, check the output of the `npm run dev` command noted above
-   point your ID towards the camera

If you prefer a short, 3 minute, video for running this project, feel free to check it out [here](https://www.youtube.com/watch?v=c0ZA8af9oBc).

If you want to recreate this project from scratch, step by step, please check out this tutorial: [Integrating ID Scanning and Extraction In Web Apps With BlinkID SDK](examples/getting-started/).

---

[![Build Status](https://travis-ci.org/BlinkID/blinkid-in-browser.svg?branch=master)](https://travis-ci.org/BlinkID/blinkid-in-browser) [![npm version](https://badge.fury.io/js/%40microblink%2Fblinkid-in-browser-sdk.svg)](https://badge.fury.io/js/%40microblink%2Fblinkid-in-browser-sdk)

BlinkID In-browser SDK enables scanning of various identity documents, including driving licenses, national identity cards, passports and others. The SDK provides real-time in-browser data extraction, without any need for sending images to servers for processing.

For more information on how to integrate BlinkID SDK into your web app, read the [instructions](#integration) below. Make sure you read the latest [CHANGELOG.md](CHANGELOG.md) file to see the most recent changes and improvements.

Check out the [official demo app](https://demo.microblink.com/in-browser-sdk/blinkid/) or live examples of BlinkID SDK in action:

1. [BlinkID SDK with built-in UI](https://blinkid.github.io/blinkid-in-browser/ui/demo.html)
2. [Scan the front side of an identity document with a web camera](https://blinkid.github.io/blinkid-in-browser/examples/blinkid-camera/javascript/index.html)
3. [Scan the front side of an identity document by uploading its image](https://blinkid.github.io/blinkid-in-browser/examples/blinkid-file/javascript/index.html)
4. [Scan both sides of an identity document with a web camera](https://blinkid.github.io/blinkid-in-browser/examples/multi-side/javascript/index.html)
5. [Scan both sides of an identity document by uploading its image](https://blinkid.github.io/blinkid-in-browser/examples/multi-side-file/javascript/index.html)
6. [Scan barcode from an identity document from web camera](https://blinkid.github.io/blinkid-in-browser/examples/idbarcode/javascript/index.html)

To see the source code of the above examples, check out the [examples directory](examples). If you'd like to run examples of the UI component, either through the browser or locally, see the [ui/examples](ui/examples) directory.

Please keep in mind that BlinkID In-browser SDK is meant to be used natively in a web browser. It may not work correctly within an embedded browser (WebView) or a NodeJS backend service. If you are looking for Cordova/PhoneGap version, please go [here](https://github.com/BlinkID/blinkid-cordova). If you want to use BlinkID as a backend service, check out [BlinkID Cloud API](https://microblink.com/products/blinkid/cloud-api) or [BlinkID Self-hosted API](https://microblink.com/products/blinkid/self-hosted-api).

## Table of contents

-   [BlinkID In-browser SDK](#blinkid-in-browser-sdk)
    -   [How to run this repo?](#how-to-run-this-repo)
    -   [Table of contents](#table-of-contents)
    -   [ Components of SDK](#-components-of-sdk)
    -   [ Integration instructions](#-integration-instructions)
        -   [ Obtaining a license key](#-obtaining-a-license-key)
        -   [ Installation](#-installation)
            -   [WASM Resources](#wasm-resources)
            -   [Versions and backward compatibility](#versions-and-backward-compatibility)
        -   [ Performing your first scan](#-performing-your-first-scan)
        -   [ Recognizing still images](#-recognizing-still-images)
        -   [ Configuration of SDK](#-configuration-of-sdk)
        -   [ Deployment guidelines](#-deployment-guidelines)
            -   [HTTPS](#https)
            -   [Deployment of WASM files](#deployment-of-wasm-files)
                -   [Server Configuration](#server-configuration)
                -   [ Location of WASM and related support files](#-location-of-wasm-and-related-support-files)
            -   [Setting up multiple licenses](#setting-up-multiple-licenses)
                -   [Multiple apps](#multiple-apps)
                -   [Single app](#single-app)
    -   [ The `Recognizer` concept, `RecognizerRunner` and `VideoRecognizer`](#-the-recognizer-concept-recognizerrunner-and-videorecognizer)
        -   [ The `Recognizer` concept](#-the-recognizer-concept)
        -   [ `RecognizerRunner`](#-recognizerrunner)
        -   [ Performing recognition of video streams using `VideoRecognizer`](#-performing-recognition-of-video-streams-using-videorecognizer)
            -   [Recognizing a video file](#recognizing-a-video-file)
        -   [ Custom UX with `VideoRecognizer`](#-custom-ux-with-videorecognizer)
    -   [ Handling processing events with `MetadataCallbacks`](#-handling-processing-events-with-metadatacallbacks)
    -   [ List of available recognizers](#-list-of-available-recognizers)
        -   [ ID barcode recognizer](#-id-barcode-recognizer)
        -   [ BlinkID Single-side recognizer](#-blinkid-single-side-recognizer)
        -   [ BlinkID Multi-side recognizer](#-blinkid-multi-side-recognizer)
    -   [ Recognizer settings](#-recognizer-settings)
    -   [ Technical requirements](#-technical-requirements)
    -   [ Supported browsers](#-supported-browsers)
    -   [ Camera devices](#-camera-devices)
    -   [ Device support](#-device-support)
    -   [ WebView usage](#-webview-usage)
    -   [ Troubleshooting](#-troubleshooting)
        -   [ Integration problems](#-integration-problems)
        -   [ SDK problems](#-sdk-problems)
            -   [ Licensing problems](#-licensing-problems)
            -   [ Other problems](#-other-problems)
    -   [ FAQ and known issues](#-faq-and-known-issues)
    -   [ Additional info](#-additional-info)

## <a name="components-of-sdk"></a> Components of SDK

BlinkID In-browser SDK consists of:

-   WASM library that recognizes a document a user is holding and extracts an image of the most suitable frame from the camera feed.
-   Web component with a prebuilt and customizable UI, which acts as a wrapper for the WASM library to provide a straightforward integration.

You can add it to your website or web app in two ways:

1. For the simplest form of integration, use a web component with a prebuilt and customizable UI.
    - Follow the integration instructions in the [ui/README.md](ui/README.md) file.
    - You can find the source code of example applications in the [ui/examples](ui/examples) directory.
2. For an advanced form of integration where UI has to be built from scratch, use a WASM library instead.
    - See the integration instructions [here](#integration).
    - Find the source code of example applications in the [examples](examples) directory.

## <a name="integration"></a> Integration instructions

This repository contains WebAssembly files and supporting JS files which contain the core implementation of BlinkID functionalities.

In order to make integration of the WebAssembly easier and more developer friendly, a JavaScript/TypeScript support code is also provided, giving you an easy-to-use integration API.

This repository also contains a sample JS/TS integration app which demonstrates how you can integrate the BlinkID into your web app.

BlinkID will work in any browser that supports [WebAssembly](https://webassembly.org), but works best with the latest versions of Firefox, Chrome, Safari and Microsoft Edge. It's worth noting that scan performance depends on the device processing capabilities.

### <a name="obtainingalicensekey"></a> Obtaining a license key

Using BlinkID in your web app requires a valid license key.

A valid license key is required to initialize scanning. You can request a free trial license key, after you register, at [Microblink Developer Hub](https://account.microblink.com/signin).

Make sure you enter a [fully qualified domain name](https://en.wikipedia.org/wiki/Fully_qualified_domain_name) of your web app when filling out the form — the license key will be bound to it. Also, if you plan to serve your web app from different domains, you'll need a license key for each one.

**Keep in mind:** Versions BlinkID 5.8.0 and above require an internet connection to work under our new License Management Program.

This means your web app has to be connected to the Internet in order for us to validate your trial license key. Scanning or data extraction of documents still happens offline, in the browser itself.

Once the validation is complete, you can continue using the SDK in an offline mode (or over a private network) until the next check.

We've added error callback to Microblink SDK to inform you about the status of your license key.

### <a name="installation"></a> Installation

We recommend you install a stable version via NPM or Yarn:

```sh
# NPM
npm install @microblink/blinkid-in-browser-sdk

# Yarn
yarn add @microblink/blinkid-in-browser-sdk
```

Which can then be used with a module bundler in Node environment:

```javascript
import * as BlinkIDSDK from "@microblink/blinkid-in-browser-sdk";
```

Source code of `BlinkIDSDK` is written in TypeScript and types are exposed in the public NPM package, so it's possible
to use the SDK in both JavaScript and TypeScript projects.

---

Alternatively, it's possible to use UMD builds which can be loaded from public CDN services.

However, **we strongly advise** that you host the JavaScript bundles on your infrastructure since there is no guarantee that the public CDN service has satisfactory uptime and availability throughout the world.

For example, it's possible to use UMD builds from [the `dist` folder on the jsDelivr CDN](https://cdn.jsdelivr.net/npm/@microblink/blinkid-in-browser-sdk/dist/). The UMD builds make `BlinkIDSDK` available as a `window.BlinkIDSDK` global variable:

```html
<!-- IMPORTANT: change "X.Y.Z" to the version number you wish to use! -->
<script src="https://cdn.jsdelivr.net/npm/@microblink/blinkid-in-browser-sdk@X.Y.Z/dist/blinkid-sdk.min.js"></script>
```

Finally, it's possible to use ES builds, which can be downloaded from [the `es` folder on jsDelivr](https://cdn.jsdelivr.net/npm/@microblink/blinkid-in-browser-sdk/es/). ES modules are used in a similar manner as NPM package:

```javascript
import * as BlinkIDSDK from "./es/blinkid-sdk.js";
```

**Important:** the jsDelivr CDN is used here due to simplicity of usage. It's not intended to be used in production!

#### WASM Resources

After adding BlinkID SDK to your project, make sure to include all files from its `resources` folder in your distribution. Those files contain compiled WebAssembly modules and support JS code.

Do not add those files to the main app bundle, but rather place them on a publicly available location so that the SDK can load them at an appropriate time. For example, place the resources in `my-angular-app/src/assets/` folder if using `ng new` or in `my-react-app/public/` folder if using `create-react-app`.

For more information on how to setup aforementioned resources, check out the [Configuration of SDK](#sdkConfiguration) section.

#### Versions and backward compatibility

Even though the API is not going to change between minor versions, the structure of results for various recognizers might change between minor versions.

This is due to the improvements we make to our recognizers with every minor release. We suggest you familiarize yourself with what [Recognizer, RecognizerRunner and VideoRecognizer](#availableRecognizers) are before moving on.

It's a good practice to always lock your minor version and check the [CHANGELOG.md](CHANGELOG.md) file before upgrading to a new minor version.

For example, in `package.json` you should have something like `"@microblink/blinkid-in-browser-sdk": "~4.1.1"` instead of the default `"@microblink/blinkid-in-browser-sdk": "^4.1.1"`.

### <a name="firstScan"></a> Performing your first scan

_Note: the following code snippets are written in TypeScript, but it's possible to use them in plain JavaScript._

1. Make sure you have a valid license key. See [Obtaining a license key](#obtainingalicensekey).

2. Add the SDK to your web app by using one of the options provided in the [Installation](#installation) section.

3. Initialize the SDK using the following code snippet:

    ```typescript
    import * as BlinkIDSDK from "@microblink/blinkid-in-browser-sdk";

    // Check if browser is supported
    if (BlinkIDSDK.isBrowserSupported()) {
        const loadSettings = new BlinkIDSDK.WasmSDKLoadSettings(
            "your-base64-license-key"
        );

        BlinkIDSDK.loadWasmModule(loadSettings).then(
            (wasmSDK: BlinkIDSDK.WasmSDK) => {
                // The SDK was initialized successfully, save the wasmSDK for future use
            },
            (error: any) => {
                // Error happened during the initialization of the SDK
                console.log(
                    "Error during the initialization of the SDK!",
                    error
                );
            }
        );
    } else {
        console.log("This browser is not supported by the SDK!");
    }
    ```

4. Create recognizer objects that will perform image recognition, configure them to your needs (to scan specific types of documents, for example) and use them to create a `RecognizerRunner` object:

    ```typescript
    import * as BlinkIDSDK from "@microblink/blinkid-in-browser-sdk";

    const recognizer = await BlinkIDSDK.createBlinkIdSingleSideRecognizer(
        wasmSDK
    );
    const recognizerRunner = await BlinkIDSDK.createRecognizerRunner(
        wasmSDK,
        [recognizer],
        true
    );
    ```

5. Obtain a reference to your HTML video element and create a `VideoRecognizer` using the element and your instance of `RecognizerRunner` which then can be used to process input video stream:

    ```typescript
    const cameraFeed = document.getElementById(
        "myCameraVideoElement"
    ) as HTMLVideoElement;
    try {
        const videoRecognizer =
            await BlinkIDSDK.VideoRecognizer.createVideoRecognizerFromCameraStream(
                cameraFeed,
                recognizerRunner
            );

        // There is more than one way to handle recognition

        // Using the recognize() method will provide you with the default behavior,
        // such as built-in error handling, timeout and video feed pausing.
        const processResult = await videoRecognizer.recognize();

        // Using the startRecognition() method allows you to pass your own onScanningDone callback,
        // giving you the option to create custom behavior.
        const processResult = await videoRecognizer.startRecognition(
            async (recognitionState) => {
                videoRecognizer.pauseRecognition();
                return recognitionState;
            }
        );

        // To obtain recognition results see next step
    } catch (error) {
        console.error(error);
    }
    ```

6. If `processResult` returned from `VideoRecognizer's` method `recognize` or `startRecognition` is not `BlinkIDSDK.RecognizerResultState.Empty`, then at least one recognizer given to the `RecognizerRunner` above contains a recognition result. You can extract the result from each recognizer using its `getResult` method:

    ```typescript
    if (processResult !== BlinkIDSDK.RecognizerResultState.Empty) {
        const recognitionResult = await recognizer.getResult();
        console.log(recognitionResult);
    } else {
        console.log("Recognition was not successful!");
    }
    ```

7. Finally, release the memory on the WebAssembly heap by calling `delete` method on both `RecognizerRunner` and each of your recognizers. Also, release the camera stream by calling `releaseVideoFeed` on instance of `VideoRecognizer`:

    ```typescript
    videoRecognizer.releaseVideoFeed();
    recognizerRunner.delete();
    recognizer.delete();
    ```

    Note that after releasing those objects it is not valid to call any methods on them, as they are literally destroyed. This is required to release memory resources on WebAssembly heap which are not automatically released with JavaScript's garbage collector. Also, note that results returned from `getResult` method are placed on JavaScript's heap and will be cleaned by its garbage collector, just like any other normal JavaScript object.

### <a name="stillImagesRecognition"></a> Recognizing still images

If you just want to perform recognition of still images and do not need live camera recognition, you can do that as well.

1. Initialize recognizers and `RecognizerRunner` as described in the [steps 1-4 above](#firstScan).

2. Make sure you have the image set to a `HTMLImageElement`. If you only have the URL of the image that needs recognizing, you can attach it to the image element with following code snippet:

    ```typescript
    const imageElement = document.getElementById(
        "imageToProcess"
    ) as HTMLImageElement;
    imageElement.src = URL.createObjectURL(imageURL);
    await imageElement.decode();
    ```

3. Obtain the `CapturedFrame` object using function `captureFrame` and give it to the `processImage` method of the `RecognizerRunner`:

    ```typescript
    const imageFrame = BlinkIDSDK.captureFrame(imageElement);
    const processResult = await recognizerRunner.processImage(imageFrame);
    ```

4. Proceed as in [steps 6-7 above](#firstScan). Note that you don't have to release any resources of `VideoRecognizer` here as we were only recognizing a single image, but `RecognizerRunner` and recognizers must be deleted using the `delete` method.

### <a name="sdkConfiguration"></a> Configuration of SDK

You can modify the default behaviour of the SDK before a WASM module is loaded.

Check out the following code snippet to learn how to configure the SDK and which non-development options are available:

```typescript
// Create instance of WASM SDK load settings
const loadSettings = new BlinkIDSDK.WasmSDKLoadSettings( "your-base64-license-key" );

/**
 * Write a hello message to the browser console when license check is successfully performed.
 *
 * Hello message will contain the name and version of the SDK, which are required information for all support
 * tickets.
 *
 * The default value is true.
 */
loadSettings.allowHelloMessage = true;

/**
 * Absolute location of WASM and related JS/data files. Useful when resource files should be loaded over CDN, or
 * when web frameworks/libraries are used which store resources in specific locations, e.g. inside "assets" folder.
 *
 * Important: if the engine is hosted on another origin, CORS must be enabled between two hosts. That is, server
 * where engine is hosted must have 'Access-Control-Allow-Origin' header for the location of the web app.
 *
 * Important: SDK and WASM resources must be from the same version of a package.
 *
 * Default value is empty string, i.e. "". In case of empty string, value of "window.location.origin" property is
 * going to be used.
 */
loadSettings.engineLocation = "";

/**
 * The absolute location of the Web Worker script file that loads the WebAssembly module.
 *
 * Important: the worker script must be served via HTTPS and must be of the same origin as the initiator.
 * See https://github.com/w3c/ServiceWorker/issues/940 (same applies for Web Workers).
 *
 * Important: SDK, worker script and WebAssembly resources must be from the same version of the package.
 *
 * The default value is an empty string, i.e. "", and in that case, the worker script is loaded from the default location in resources folder.
 */
loadSettings.workerLocation = "";

/**
 * Type of the WASM that will be loaded. By default, if not set, the SDK will automatically determine the best WASM
 * to load.
 */
loadSettings.wasmType: WasmType | null = null;

/**
 * Optional callback function that will report the SDK loading progress.
 *
 * This can be useful for displaying progress bar to users with slow connections.
 *
 * The default value is "null".
 *
 * @example
 * loadSettings.loadProgressCallback = (percentage: number) => console.log(`${ percentage }% loaded!`);
 */
loadSettings.loadProgressCallback = null;

// After load settings are configured, proceed with the loading
BlinkIDSDK.loadWasmModule( loadSettings ).then( ... );
```

There are some additional options which can be seen in the configuration class [WasmLoadSettings](src/MicroblinkSDK/WasmLoadSettings.ts).

### <a name="deploymentGuidelines"></a> Deployment guidelines

This section contains information on how to deploy a web app which uses BlinkID In-browser SDK.

#### HTTPS

Make sure to serve the web app over a HTTPS connection.

Otherwise, the browser will block access to a web camera and remote scripts due to security policies.

#### Deployment of WASM files

The SDK contains multiple builds tailored for different devices' capabilities.

-   `Basic`

    -   The WASM that will be loaded will be most compatible with all browsers that support the WASM, but will lack features that could be used to improve performance.

-   `Advanced`

    -   The WASM that will be loaded will be built with advanced WASM features, such as bulk memory, SIMD, non-trapping floating point and sign extension. Such WASM can only be executed in browsers that support those features. Attempting to run this WASM in a non-compatible browser will crash your app.

-   `AdvancedWithThreads`

    -   The WASM that will be loaded will be build with advanced WASM features, just like above. Additionally, it will be also built with support for multi-threaded processing. This feature requires a browser with support for both advanced WASM features and `SharedArrayBuffer`.

    -   For multi-threaded processing there are some things that needs to be set up additionally, like COOP and COEP headers, more info about web server setup can be found [here](#wasmsetup).

    -   Keep in mind that this WASM bundle requires that all resources are on the same origin. So, for example, it's not possible to load WASM files from some CDN. This limitation exists due to browser security rules.

Additionally, there's two different BlinkID variants:

-   **Full**

    -   Regular build that has barcode deblurring models. This build is loaded automatically on desktop devices.

-   **Lightweight**
    -   Build without deblurring models. This build is loaded automatically on mobile devices. Deblurring models are usually not necessary due to better quality cameras compared to front-facing laptop cameras.

These builds each contain previous build variants present so far: basic, advanced with SIMD and advanced with multithreading making a total of 6 possible builds.

These builds can be overridden by using a new property on the settings objects `WasmSDKLoadSettings.blinkIdVariant`:

```ts
export type BlinkIDVariant = "full" | "lightweight";
```

##### Server Configuration

If you know how WebAssembly works, then you'll know a browser will load the `.wasm` file it needs to compile it to the native code. This is unlike JavaScript code, which is interpreted and compiled to native code only if needed ([JIT, a.k.a. Just-in-time compilation](https://en.wikipedia.org/wiki/Just-in-time_compilation)). Therefore, before BlinkID is loaded, the browser must download and compile the provided `.wasm` file.

In order to make this faster, you should configure your web server to serve `.wasm` files with `Content-Type: application/wasm`. This will instruct the browser that this is a WebAssembly file, which most modern browsers will utilize to perform streaming compilation, i.e. they will start compiling the WebAssembly code as soon as first bytes arrive from the server, instead of waiting for the entire file to download.

For more information about streaming compilation, check [this article from MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/instantiateStreaming).

If your server supports serving compressed files, you should utilize that to minimize the download size of your web app. It's easy to notice that `.wasm` file is not a small file, but it is very compressible. This is also true for all other files that you need to serve for your web app.

For more information about configuring your web server to compress and optimally deliver BlinkID SDK in your web app, see the [official Emscripten documentation](https://emscripten.org/docs/compiling/Deploying-Pages.html#optimizing-download-sizes).

##### <a name="wasmsetup"></a> Location of WASM and related support files

You can host WASM and related support files in a location different from the one where your web app is located.

For example, your WASM and related support files can be located in `https://cdn.example.com`, while the web app is hosted on `https://example.com`.

In that case it's important to set [CORS headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin) in response from `https://cdn.example.com`. i.e. set header `Access-Control-Allow-Origin` with proper value so that the web page knows it’s okay to take on the request.

If WASM engine folders are not placed in the same folder as web app, don't forget to configure instance of `WasmSDKLoadSettings` with proper location:

```typescript
...
const loadSettings = new BlinkIDSDK.WasmSDKLoadSettings( licenseKey );

loadSettings.engineLocation = "https://cdn.example.com/wasm";
...
```

The location should point to folder containing folders `basic`, `advanced` and `advanced-threads` that contain the WebAssembly and its support files.

The difference between `basic`, `advanced` and `advanced-threads` folders are in the way the WebAssembly file was built:

-   WebAssembly files in `basic` folder were built to be most compatible, but less performant.
-   WebAssembly files in `advanced` folder can yield better scanning performance, but requires more modern browser
-   WebAssembly files in the `advanced-threads` folder uses advanced WASM features as the WASM in the `advanced` folder but will additionally use WebWorkers for multi-threaded processing which will yield best performance.

Depending on what features the browser actually supports, the correct WASM file will be loaded automatically.

Note that in order to be able to use WASM from the `advanced-threads` folder, you need to configure website to be "cross-origin isolated" using COOP and COEP headers, as described [in this article](https://web.dev/coop-coep/). This is required for browser to allow using the `SharedArrayBuffer` feature which is required for multi-threaded processing to work. Without doing so, the browser will load only the single-threaded WASM binary from the `advanced` folder.

```
# NGINX web server COEP and COOP header example

...

server {
    location / {
        add_header Cross-Origin-Embedder-Policy: require-corp;
        add_header Cross-Origin-Opener-Policy: same-origin;
    }
}

...
```

#### Setting up multiple licenses

As mentioned, the license key of BlinkID SDK is tied to your domain name, so it's required to initialize the SDK with different license keys based on the location of your web app.

A common scenario is to have different license keys for development on the local machine, staging environment and production environment. Our team will be happy to issue multiple trial licenses if needs be. See [Obtaining a license key](#obtainingalicensekey).

There are two most common approaches regarding setup of your license key(s):

1. Multiple apps: build different versions of your web app for different environments
2. Single app: build a single version of your web app which has logic to determine which license key to use

##### Multiple apps

Common approach when working with modern frameworks/libraries.

-   [Using environment variables in React](https://medium.com/@trekinbami/using-environment-variables-in-react-6b0a99d83cf5#:~:text=In%20short%3A%20environment%20variables,re%20going%20to%20need%20webpack.)
-   [Building and serving Angular apps](https://angular.io/guide/build)
-   [Vue.js: Modes and Environment Variables](https://cli.vuejs.org/guide/mode-and-env.html#environment-variables)

##### Single app

Simple approach, where handling of license key is done inside the web app.

Here is one possible solution:

```typescript
let licenseKey = "..."; // Place your development license key here

if ( window.location.hostname === "staging.example.com" ) // Place your staging domain here
{
    licenseKey = "..."; // Place your staging license key here
}

if ( window.location.hostname === "example.com" ) // Place your production domain here
{
    licenseKey = "..."; // Place your production license key here
}
...
```

## <a name="availableRecognizers"></a> The `Recognizer` concept, `RecognizerRunner` and `VideoRecognizer`

This section will first describe [what a `Recognizer`](#recognizerConcept) is and how it should be used to perform recognition of images, videos and camera stream. We'll also describe what [`RecognizerRunner`](#recognizerRunner) is and how it can be used to tweak the recognition procedure. Finally, we'll describe what [`VideoRecognizer`](#videoRecognizer) is and explain how it builds on top of `RecognizerRunner` in order to provide support for recognizing a video or a camera stream.

### <a name="recognizerConcept"></a> The `Recognizer` concept

The `Recognizer` is the basic unit tasked with reading documents within the domain of BlinkID SDK. Its main purpose is to process the image and extract meaningful information from it. As you will see later, BlinkID SDK has lots of different `Recognizer` objects you can set up to recognize various documents.

The `Recognizer` is the object on the WebAssembly heap, which means that it will not be automatically cleaned up by the garbage collector once it's not required anymore. Once you are done using it, you must call the `delete` method on it to release the memory on the WebAssembly heap. Failing to do so will result in memory leak on the WebAssembly heap which may result in a crash of the browser tab running your web app.

Each `Recognizer` has a `Result` object, which contains the data that was extracted from the image. The `Result` for each specific `Recognizer` can be obtained by calling its `getResult` method, which will return a `Result` object placed on the JS heap, i.e. managed by the garbage collector. Therefore, you don't need to call any delete-like methods on the `Result` object.

Every `Recognizer` is a stateful object that can be in two possible states: _idle state_ and _working state_.

While in _idle state_, you are allowed to call method `updateSettings` which will update its properties according to the given settings object. At any time, you can call its `currentSettings` method to obtain its currently applied settings object.

After you create a `RecognizerRunner` with an array containing your recognizer, the state of the `Recognizer` will change to _working state_, in which `Recognizer` object will be used for processing. While being in _working state_, it is not possible to call method `updateSettings` (calling it will crash your web app).

If you need to change configuration of your recognizer while it's being used, you need to:

1. Call its `currentSettings` method to obtain its current configuration
2. Update it as you need it
3. Create a new `Recogizer` of the same type
4. Call `updateSettings` on it with your modified configuration
5. Replace the original `Recognizer` within the `RecognizerRunner` by calling its `reconfigureRecognizers` method

When written as a pseudocode, this would look like:

```typescript
import * as BlinkIDSDK from "@microblink/blinkid-in-browser-sdk";

// Assume myRecognizerInUse is used by the recognizerRunner
const currentSettings = await myRecognizerInUse.currentSettings();

// Modify currentSettings as you need
const newRecognizer = await BlinkIDSDK.createRecognizer(); // use appropriate recognizer creation function
await newRecognizer.updateSettings(currentSettings);

// Reconfigure recognizerRunner
await recognizerRunner.reconfigureRecognizers([newRecognizer], true); // use `true` or `false` depending of what you want to achieve (see below for the description)

// newRecognizer is now in use and myRecognizerInUse is no longer in use -
// you can delete it if you don't need it anymore
await myRecognizerInUse.delete();
```

While `Recognizer` object works, it changes its internal state and its result. The `Recognizer` object's `Result` always starts in `Empty` state. When corresponding `Recognizer` object performs the recognition of a given image, its `Result` can either stay in `Empty` state (in case `Recognizer` failed to perform recognition), move to `Uncertain` state (in case `Recognizer` performed the recognition, but not all mandatory information was extracted) or move to `Valid` state (in case `Recognizer` performed recognition and all mandatory information was successfully extracted from the image).

### <a name="recognizerRunner"></a> `RecognizerRunner`

The `RecognizerRunner` is the object that manages the chain of individual `Recognizer` objects within the recognition process.

It must be created by `createRecognizerRunner` method of the `WasmModuleProxy` interface, which is a member of `WasmSDK` interface which is resolved in a promise returned by the `loadWasmModule` function you've seen [above](#firstScan). The function requires two parameters: an array of `Recognizer` objects that will be used for processing and a `boolean` indicating whether multiple `Recognizer` objects are allowed to have their `Results` enter the `Valid` state.

To explain the `boolean` parameter further, we first need to understand how `RecognizerRunner` performs image processing.

When the `processImage` method is called, it processes the image with the first `Recognizer` in the chain. If `Recognizer's` `Result` object changes its state to `Valid`, and if the above `boolean` parameter is `false`, the recognition chain will be stopped and `Promise` returned by the method will be immediately resolved. If the above parameter is `true`, then the image will also be processed with other `Recognizer` objects in chain, regardless of the state of their `Result` objects.

That means if after processing the image with the first `Recognizer` in the chain, its `Result` object's state is not changed to `Valid`, the `RecognizerRunner` will use the next `Recognizer` object in chain for processing the image and so on - until the end of the chain (if no results become valid or always if above parameter is `true`) or until it finds the recognizer that has successfully processed the image and changed its `Result's` state to `Valid` (if above parameter is `false`).

You cannot change the order of the `Recognizer` objects within the chain - regardless of the order in which you give `Recognizer` objects to `RecognizerRunner` (either to its creation function `createRecognizerRunner` or to its `reconfigureRecognizers` method), they are internally ordered in a way that ensures the best performance and accuracy possible.

Also, in order for BlinkID SDK to be able to sort `Recognizer` objects in the recognition chain the best way, it is not allowed to have multiple instances of `Recognizer` objects of the same type within the chain. Attempting to do so will crash your application.

### <a name="videoRecognizer"></a> Performing recognition of video streams using `VideoRecognizer`

Using `RecognizerRunner` directly could be difficult in cases when you want to perform recognition of the video or the live camera stream. Additionally, handling camera management from the web browser can be [sometimes challenging](https://stackoverflow.com/questions/59636464/how-to-select-proper-backfacing-camera-in-javascript). In order to make this much easier, we provided a `VideoRecognizer` class.

To perform live camera recognition using the `VideoRecognizer`, you will need an already configured `RecognizerRunner` object and a reference to `HTMLVideoElement` to which camera stream will be attached.

To perform the recognition, you should simply write:

```typescript
const cameraFeed = <HTMLVideoElement>document.getElementById("cameraFeed");
try {
    const videoRecognizer =
        await BlinkIDSDK.VideoRecognizer.createVideoRecognizerFromCameraStream(
            cameraFeed,
            recognizerRunner
        );
    const processResult = await videoRecognizer.recognize();
} catch (error) {
    // Handle camera error
}
```

The `recognize` method of the `VideoRecognizer` will start the video capture and recognition loop from the camera and will return a `Promise` that will be resolved when either `processImage` of the given `RecognizerRunner` returns `Valid` for some frame or the timeout given to `recognize` method is reached (if no timeout is given, a default one is used).

#### Recognizing a video file

If, instead of performing recognition of live video stream, you want to perform recognition of a pre-recorded video, you should simply construct `VideoRecognizer` using a different function, as shown below:

```typescript
const videoRecognizer = await BlinkIDSDK.createVideoRecognizerFromVideoPath(
    videoPath,
    htmlVideoElement,
    recognizerRunner
);
const processResult = await videoRecognizer.recognize();
```

### <a name="customUXWithVideoRecognizer"></a> Custom UX with `VideoRecognizer`

The procedure for using `VideoRecognizer` described [above](#videoRecognizer) is quite simple, but has some limits. For example, you can only perform one shot scan with it. As soon as the promise returned by `recognize` method resolves, the camera feed is paused and you need to start new recognition.

However, if you need to perform multiple recognitions in single camera session, without pausing the camera preview, you can use the `startRecognition` method, as described in the example below:

```typescript
videoRecognizer.startRecognition(
    (recognitionState: BlinkIDSDK.RecognizerResultState) => {
        // Pause recognition before performing any async operation - this will make sure that
        // recognition will not continue while returning the control flow back from this function.
        videoRecognizer.pauseRecognition();

        // Obtain recognition results directly from recognizers associated with the RecognizerRunner
        // that is associated with the VideoRecognizer

        if (shouldContinueScanning) {
            // Resume recognition
            videoRecognizer.resumeRecognition(true);
        } else {
            // Pause the camera feed
            videoRecognizer.pauseVideoFeed();
            // After this line, the VideoRecognizer is in the same state as if promise returned from
            // recognizer was resolved
        }
        // If videoRecognizer is not paused or terminated, after this line the recognition will
        // continue and recognition state will be retained
    }
);
```

## <a name="metadataCallbacks"></a> Handling processing events with `MetadataCallbacks`

Processing events, also known as _Metadata callbacks_ are purely intended to provide users with on-screen scanning guidance or to capture some debug information during development of your web app using BlinkID SDK.

Callbacks for all events are bundled into the [MetadataCallbacks](src/MicroblinkSDK/MetadataCallbacks.ts) object. We suggest that you have a look at the available callbacks and events which you can handle in the [source code of the `MetadataCallbacks` interface](src/MicroblinkSDK/MetadataCallbacks.ts).

You can link the `MetadataCallbacks` interface with `RecognizerRunner` either during creation or by invoking its method `setMetadataCallbacks`. Please note that both those methods need to pass information about available callbacks to the native code. For efficiency reasons this happens at the time `setMetadataCallbacks` is called, **not every time** a change occurs within the `MetadataCallbacks` object.

This means that if you, for example, set `onQuadDetection` to `MetadataCallbacks` after you already called `setMetadataCallbacks` method, the `onQuadDetection` will not be registered with the native code and therefore it will not be called.

Similarly, if you remove the `onQuadDetection` from `MetadataCallbacks` object after you already called `setMetadataCallbacks` method, your app will crash in attempt to invoke a non-existing function when our processing code attempts to invoke it. We **deliberately** do not perform null check here because of two reasons:

-   It is inefficient
-   Having no callback, while still being registered to native code is illegal state of your program and it should therefore crash

**Remember** that whenever you make some changes to the `MetadataCallbacks` object, you need to apply those changes to your `RecognizerRunner` by calling its `setMetadataCallbacks` method.

## <a name="recognizerList"></a> List of available recognizers

This section will give a list of all `Recognizer` objects that are available within BlinkID SDK, their purpose and recommendations on how they should be used to achieve best performance and user experience.

### <a name="idBarcodeRecognizer"></a> ID barcode recognizer

The [`IdBarcodeRecognizer`](src/Recognizers/BlinkID/IDBarcode/IdBarcodeRecognizer.ts) is a recognizer specialized for scanning barcodes from various ID cards.

### <a name="blinkidSingleSideRecognizer"></a> BlinkID Single-side recognizer

The [`BlinkIdSingleSideRecognizer`](src/Recognizers/BlinkID/Generic/BlinkIdSingleSideRecognizer.ts) scans and extracts data from the single side of the supported document.

You can find the list of the currently supported documents [here](docs/BlinkIDRecognizer.md). For detailed information about which fields can be extracted from each document, [check this link](docs/BlinkIDDocumentFields.md).

We will continue expanding this recognizer by adding support for new document types in the future. Star this repo to stay updated.

### <a name="blinkidMultiSideRecognizer"></a> BlinkID Multi-side recognizer

Use [`BlinkIdMultiSideRecognizer`](src/Recognizers/BlinkID/Generic/BlinkIdMultiSideRecognizer.ts) for scanning both sides of the supported document. First, it scans and extracts data from the front, then scans and extracts data from the back, and finally, combines results from both sides.

The [`BlinkIdMultiSideRecognizer`](src/Recognizers/BlinkID/Generic/BlinkIdMultiSideRecognizer.ts) also performs data matching and returns a flag if the extracted data captured from the front side matches the data from the back.

You can find the list of the currently supported documents [here](docs/BlinkIDRecognizer.md). For detailed information about which fields can be extracted from each document, [check this link](docs/BlinkIDDocumentFields.md).

We will continue expanding this recognizer by adding support for new document types in the future. Star this repo to stay updated.

## <a name="recognizerSettings"></a> Recognizer settings

It's possible to enable various recognizer settings before recognition process to modify default behaviour of the recognizer.

List of all recognizer options is available in the source code of each recognizer, while list of all recognizers is available in the [List of available recognizers](#recognizerList) section.

Recognizer settings should be enabled right after the recognizer has been created in the following manner:

```typescript
// Create instance of recognizer
const BlinkIdSingleSideRecognizer = await BlinkIDSDK.createBlinkIdSingleSideRecognizer( sdk );

// Retrieve current settings
const settings = await BlinkIdSingleSideRecognizer.currentSettings();

// Update desired settings
settings[ " <recognizer_available_setting> " ] = true;

// Apply settings
await BlinkIdSingleSideRecognizer.updateSettings( settings );

...
```

## <a name="technicalRequirements"></a> Technical requirements

This document provides information about technical requirements of end-user devices to run BlinkID.

Requirements:

1. The browser is [supported](#supported-browsers).
2. The browser [has access to camera device](#camera-devices).
3. The device has [enough computing power](#device-support) to extract data from an image.

## <a name="webassembly-support"></a> Supported browsers

Minimal browser versions with support for all features required by BlinkID.

| Chrome | Safari | Edge | Firefox | Opera | iOS Safari | Android Browser | Chrome for Android | Firefox for Android |
| ------ | ------ | ---- | ------- | ----- | ---------- | --------------- | ------------------ | ------------------- |
| 96     | 15     | 93   | 79      | 82    | 15         | 81              | 96                 | 79                  |

Internet Explorer is **not supported**.

_Sources: [caniuse](https://caniuse.com/wasm) and [WebAssembly Roadmap](https://webassembly.org/roadmap/)_

## <a name="camera-devices"></a> Camera devices

_Keep in mind that camera device is optional, since BlinkID can extract data from still images._

SDK cannot access camera on **iOS 14.2** and older versions when the end-user is using a web browser **other than Safari**. Apple does not allow access to camera via WebRTC specification for other browsers.

**Notes & Guidelines**

-   For optimal data extraction use high-quality camera device in well-lit space and don't move the camera too much.
-   It's recommended to use camera devices with autofocus functionality for fastest data extraction.
-   Camera devices on MacBook laptops don't work well with low ambient light, i.e. scanning will take longer than usual.

## <a name="device-support"></a> Device support

It's hard to pinpoint exact hardware specifications for successful data extraction, but based on our testing mid-end and high-end smartphone devices released in 2018 and later should be able to extract data from an image in a relatively short time frame.

**Notes & Guidelines**

-   Browsers supported by BlinkID can run on older devices, where extraction can take much longer to execute, e.g. around 30 or even 40 seconds.

## <a name="webview-usage"> WebView usage</a>

The SDK can be used within a `SFSafariViewController` on iOS and `WebView` on Android. Usage examples can be found in the following repositories:

-   https://github.com/BlinkID/example-ios-webview-blinkid
-   https://github.com/BlinkID/example-android-webview-blinkid

Microblink doesn't officially support webview integrations but following the principles in the example applications should allow the SDK to function in a webview context.

## <a name="troubleshoot"></a> Troubleshooting

### <a name="integrationProblems"></a> Integration problems

In case you're having issues integrating our SDK, the first thing you should do is revisit our [integration instructions](#firstScan) and make sure to closely follow each step.

If you have followed the instructions to the letter and you still have problems, please contact us at [help.microblink.com](https://help.microblink.com).

When contacting us, please make sure you include the following information:

-   Log from the web console.
-   High resolution scan/photo of the document that you are trying to scan.
-   Information about the device and browser that you are using — we need the exact version of the browser and operating system it runs on. Also, if it runs on a mobile device, we also need the model of the device in question (camera management is specific to browser, OS and device).
-   Please stress out that you are reporting a problem related to the WebAssembly version of the BlinkID SDK.

### <a name="sdkProblems"></a> SDK problems

In case of problems with using the SDK, you should do as follows:

#### <a name="licensingProblems"></a> Licensing problems

If you are getting an "invalid license key" error or having other license-related problems (e.g. some feature is not enabled that should be), first check the browser console. All license-related problems are logged to the web console so that it's easier to determine what went wrong.

When you can't determine the license-related problem or you simply do not understand the log information, you should contact us at [help.microblink.com](http://help.microblink.com). When contacting us, please make sure you provide following information:

-   Exact fully qualified domain name of your app, i.e. where the app is hosted.
-   License that is causing problems.
-   Please stress out that you are reporting a problem related to the WebAssembly version of the BlinkID SDK.
-   If unsure about the problem, you should also provide an excerpt from the web console containing the license error.

#### <a name="otherProblems"></a> Other problems

If you are having problems with scanning certain items, undesired behaviour on specific device(s), crashes inside BlinkID SDK or anything unmentioned, please contact our support with the same information as listed at the start of this section.

## <a name="faq"></a> FAQ and known issues

-   **After switching from trial to production license I get error `This entity is not allowed by currently active license!` when I create a specific `Recognizer` object.**

Each license key contains information about which features are allowed to use and which are not. This error indicates that your production license does not allow the use of a specific `Recognizer` object. You should contact [support](http://help.microblink.com) to check if the provided license is OK and that it really contains the features you've requested.

-   **Why am I getting No internet connection error if I'm on a private network?**

Versions BlinkID 5.8.0 and above require an internet connection to work under our new License Management Program.

This means your web app has to be connected to the Internet in order for us to validate your trial license key. Scanning or data extraction of documents still happens offline, in the browser itself.

Once the validation is complete, you can continue using the SDK in an offline mode (or over a private network) until the next check.

We've added error callback to Microblink SDK to inform you about the status of your license key.

## <a name="info"></a> Additional info

Complete source code of the TypeScript wrapper can be found [here](src).

For any other questions, feel free to contact us at [help.microblink.com](http://help.microblink.com).
