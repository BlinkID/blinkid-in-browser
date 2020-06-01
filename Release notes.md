# Release notes

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
