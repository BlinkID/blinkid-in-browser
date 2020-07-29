# Release notes

## 5.5.1

- Removed `alert()` from [VideoRecognizer](src/MicroblinkSDK/VideoRecognizer.ts) and added `allowManualVideoPlayout` to constructor of `VideoRecognizer` class
- Added `locateFile` method to [MicroblinkSDK](src/MicroblinkSDK/MicroblinkSDK.ts) to fix problem when SDK is not using web worker
- File `package.json`
    - Added field `engines` to explicitly specify Node version which was used during development
    - Fixed typo in `repository` field so NPM package can be used with yarn, closes [#5](https://github.com/BlinkID/blinkid-in-browser/issues/5)
- Documentation
    - Added more information and renamed section "Optimal deployment of your web app" to "Deployment guidelines"
    - Added links to Codepen examples and official demo app

## 5.5.0

- Change of available recognizers
    - Removed `MRTDRecognizer`
    - Added `BlinkIdGenericRecognizer` and `BlinkIdCombinedRecoginzer`, with list of supported documents available in `docs/BlinkIdRecognizer.md`
- Standardization of NPM package
    - NPM package can be used in environments with module bundlers
    - Added ES and UMD bundles for the SDK
    - Types are now exposed and accessible in standard manner for NPM environment
    - Extended `package.json` with project information and scripts for building and publishing
    - Added Rollup build system to provide developers with infrastructure for easier customization of SDK
- Extension of examples
    - Examples now cover more functionalities of the SDK
    - Provided examples for integration in TS, ES and UMD environment
- Configuration options for WASM engine and WebWorker locations
    - Configurations `engineLocation` and `workerLocation` are defined in the `WasmSDKLoadSettings` class
- Improved stability and readability of SDK TypeScript source code
    - Added ESLint for automatic check of unsecure language constructs
    - Added Babel for safe transpiling to ES6 and better browser support

## 1.0.0-beta.1

- decreased WASM binary size from 3.8 MB to 2.5 MB
- fixed vulnerability in license check
- added support for disabling hello message after license key gets validated
    - by default this is still enabled, to disable it, set `allowHelloMessage` property in [WasmSDKLoadSettings](src/MicroblinkSDK/WasmLoadSettings.ts) to `false`
- updates to [IdBarcodeRecognizer](src/Recognizers/BlinkID/IDBarcode/IdBarcodeRecognizer.ts):
    - added `endorsements`, `restrictions` and `vehicleClass` fields to its result
        - those fields are available only when scanning barcode from driver license
    - added support for returning raw barcode data in case data parsing fails
        - this requires a permission within a license key
    - changed the behaviour of `firstName` field:
        - now it contains both first name, middle name and name suffix

## 1.0.0-beta.0

- initial beta release of the BlinkID In-browser SDK
- supported recognizers:
    - ID Barcode recognizer for scanning barcodes from various ID documents
    - MRTD recognizer for scanning Machine Readable Zone (MRZ) from Machine Readable Travel Documents (MRTDs), such as IDs and passports
