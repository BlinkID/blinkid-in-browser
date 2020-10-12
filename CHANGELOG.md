# Release notes

## 5.8.1

* Fixed NPM package to include UI component.

## 5.8.0

### New additions to our supported documents list

#### Plastic page passports

We added support for scanning the visual inspection zone - VIZ includes everything except MRZ or barcode. Keep in mind that BlinkID scans and extracts data only from the VIZ that is on the first **plastic page** found in the passport list below:

* **Chile** Passport (BETA)
* **Colombia** Passport
* **Croatia** Passport
* **Denmark** Passport
* **Finland** Passport (BETA)
* **Germany** Passport
* **Hong Kong** Passport (BETA)
* **Ireland** Passport (BETA)
* **Malaysia** Passport
* **Netherlands** Passport
* **New Zealand** Passport
* **Norway** Passport
* **Singapore** Passport
* **South Africa** Passport
* **Sweden** Passport
* **Turkey** Passport (BETA)
​
#### Vertical US documents

* **California** ID
* **Illinois** ID
* **New York** ID
* **North Carolina** ID
* **Texas** ID
​
#### Other documents

* **Canada** Newfoundland and Labrador DL
* **Croatia** Residence Permit (BETA)
* **Guatemala** Consular ID
* **Malaysia** MyKAS (BETA)
* **Mexico** Jalisco DL / front side only
* **Mexico** Nuevo Leon DL (BETA)
* **Peru** ID (BETA)
* **Singapore** S Pass (BETA)
* **Uruguay** ID / front side only
* **USA** Missouri ID
* **USA** Texas ID

#### European DLs with a single line MRZ

BlinkID extracts data from driver’s licenses that contain single line MRZ:

* **Croatia** DL
* **Estonia** DL
* **France** DL
* **Ireland** DL
* **Netherlands** DL
* **Slovakia** DL

#### Back side supported on:

* **Azerbaijan** ID
* **Singapore** DL
* **Singapore** Employment Pass

#### No longer BETA

* **Slovakia** DL

### New features and updates in BlinkID(Combined)Recognizer

* We added `signatureImage` to the result. Extract signature image from the documents below:
    * Australia Victoria DL
    * Austria ID
    * Austria DL
    * Brunei Military ID
    * Colombia ID
    * Croatia ID (on 2013 and 2015 versions)
    * Cyprus ID
    * Czechia ID (on the 2012 version)
    * Germany ID (2010 version)
    * Germany DL (2013 version)
    * Indonesia ID
    * Ireland DL
    * Italy DL
    * Mexico Voter ID
    * New Zealand DL
    * Slovenia ID
    * Spain DL
    * Sweden DL
    * Switzerland ID
    * UAE ID
    * UAE Resident ID

* We enabled extraction of the **date of birth** from the **NRIC** from Malaysian documents:
    * MyKad
    * MyKas
    * MyKid
    * MyPR
    * MyTentera

* We added anonymization support for:
    * MRZ (OPT2 containing the ID number) on China Mainland Travel Permit Hong Kong
    * MRZ (Document number) on Germany Alien Passport
    * Document number, MRZ (Document number) on Germany ID
    * MRZ (Document number) on Germany Minors Passport
    * MRZ (Document number) on Germany Passport
    * Document number on Hong Kong ID
    * MRZ (Document number, OPT1 containing the passport or ID number) on Hong Kong Passport
    * Personal ID number on Netherlands DL
    * Personal ID number, MRZ (OPT1 containing the BSN) on Netherlands ID
    * MRZ (OPT1 containing the BSN) on Netherlands Passport
    * Document number on Singapore DL
    * Personal ID number on Singapore Employment Pass
    * Document number on Singapore FIN Card
    * Document number on Singapore ID
    * MRZ (Document number, OPT1 containing the NRIC) on Singapore Passport
    * Document number on Singapore Resident ID
    * Document number on Singapore S Pass
    * Personal ID number on Singapore Work Permit
    * MRZ (OPT1 containing the resident registration number) on South Korea Diplomatic Passport 
    * MRZ (OPT1 containing the resident registration number) on South Korea Passport
    * MRZ (OPT1 containing the resident registration number) on South Korea Residence Passport
    * MRZ (OPT1 containing the resident registration number) on South Korea Service Passport
    * MRZ (OPT1 containing the resident registration number) on South Korea Temporary Passport

* We improved MRZ data extraction on:
    * **Russia Passport**

* Added additional [recognizer options](src/Recognizers/BlinkID/Generic/BlinkIDRecognizer.ts):
    * `BarcodeScanningStartedCallback` callback that is invoked when barcode recognition is started.
    * `ClassifierCallback` callback that is invoked when document classification is completed.
    * `allowedDocumentClasses` property which indicates whether the given document is supported or not.

* Added support for filtering only specific document classes.

### UI component

* We added a UI component in the format of a custom web element to use BlinkID on your web in an effortless way.
* Check out the [README file](README.md) for instructions on how to use UI component, or check the [ui directory](/ui) for complete source code.

### Other features and updates

* We added the field `middleName` to BlinkID(Combined)Recognizer, IDBarcodeRecognizer and USDL(Combined)Recognizer results. This field is extracted from AAMVA standard compliant barcodes, whenever available.

### Minor API changes

* We removed `workerLocation` property from `WasmSDKLoadSettings`.
    * Web worker is now inlined into the source code, which simplifies the SDK deployment and usage.
    * Property `engineLocation` in `WasmSDKLoadSettings` **must** be an absolute path.
    * Removed `useWebWorker` property from `WasmSDKLoadSettings`, since web worker is now always used as it provides much better user experience
      and does not block the UI browser thread.

### Fixes

* We improved the data match logic for **Guatemala Consular ID** in BlinkID(Combined)Recognizer.
* We fixed the initialization promise chain so that you can handle all initialization errors with a single error handler ([Issue #13](https://github.com/BlinkID/blinkid-in-browser/issues/13)).

## 5.7.0

### **New features:**

- IDBarcodeRecognizer now returns:
    - Street, postal code, city and jurisdiction.
- In BlinkIDRecognizer and BlinkIDCombinedRecognizer, we added:
    - Support for US driver licenses with **vertical** orientations:
        - Alabama
        - Arizona
        - California
        - Colorado
        - Connecticut
        - Georgia
        - Illinois
        - Iowa
        - Kansas
        - Kentucky
        - Maryland
        - Massachusetts
        - Minnesota
        - Missouri
        - New Jersey
        - Ohio
        - Pennsylvania
        - South Carolina
        - Tennessee
        - Texas
        - Utah
        - Washington
        - Wisconsin
    - **Support for new document types**:
        - Croatia Health Insurance Card / front side / BETA
        - Ecuador ID / front side
        - El Salvador ID / BETA
        - Sri Lanka ID / BETA
    - **Driver licenses no longer in BETA**:
        - Canada Nova Scotia
        - Canada Yukon
        - Norway
    - **Back side** support:
        - Kenya ID
    - We added support for new MRZ formats on:
        - Guatemala ID
        - Kenya ID
        - Mexico consular ID
        - Northern Cyprus ID
        - Chinese Mainland Travel Permits (Hong Kong, Macau and Taiwan)
- Added **result anonymization**. With this option enabled, results are not returned for protected fields on documents listed here. The full document image will also have this data blacked out.
    - Protected fields are:
        - Document number on Hong Kong ID
        - MRZ on Hong Kong passports and Chinese mainland travel permits for Hong Kong
        - Personal ID number on Netherlands driver licence
        - Personal ID number and MRZ on Netherlands ID
        - MRZ on Netherlands passports
        - Document number on Singapore driver license, ID, Fin Card, Resident ID
        - Personal ID number on Singapore Employment Pass
        - Document number and personal ID number on Singapore Work Permit
        - MRZ on Singapore passports
    - By using `setAnonymizationMode` method, you can choose the AnonymizationMode: `ImageOnly`, `ResultFieldsOnly`, `FullResult` or `None`.
    - FullResult anonymization (both images and data) is set by default.

### **Improvements to existing features:**

- We made changes to the result structure of BlinkIdCombinedRecognizer and BlinkIdRecognizer:
    - Barcode data is now encapsulated in its own result structure: `BarcodeResult`.
    - Data from all OCR-ed fields, without MRZ data, is now encapsulated in a `VIZResult` structure, representing the "Visual Inspection Zone" data. In BlinkIdCombinedRecognizer, front side data is available in its own structure (frontVizResult), back side data in its own (backVizResult), so you can now access data from each side separately.
    - The main part of the result, outside these structures, is filled according to these rules:
        - The document number is filled with MRZ data, if present.
        - The remaining data is then filled from the barcode.
        - The remaining data is filled from back side visual inspection zone (OCR data outside of MRZ).
        - The remaining data is filled from the front side visual inspection zone.
        - The remaining data is filled from the MRZ.
- Members `colorStatus` and `moireStatus` can now be found in the result's `imageAnalysisResult` (`frontImageAnalysisResult` and `backImageAnalysisResult` in `BlinkIDCombinedRecognizer`).
- We added **blur detection status** to `imageAnalysisResult`.
    - We extended `ImageAnalysisResult` with information on whether the document contains a photo, MRZ and/or barcode.
        - We renamed `DocumentImageMoireStatus` to `ImageAnalysisDetectionStatus` so it can be reused for other status information.
    - We added a `RecognitionModeFilter` setting. This makes it possible to control for which group of documents (MrzId, MrzVisa, MrzPassport, PhotoId, FullRecognition) recognition is enabled or disabled.
    - We added a `RecognitionMode` result member detailing which of the aforementioned recognition modes was used to obtain the result.
    - We added a fallback method that extracts ‘sex’ and ‘nationality’ fields from the MRZ in case they aren’t present in the VIZ or the barcode. Previously, only ‘dates’, ‘names’ and ‘document numbers’ had the fallback method.
    - Unsuccessfully parsed dates now preserve original string instead of returning empty string.

### **Bug fixes:**

- We fixed US driver's license address extraction (Oregon, Mississippi, Rhode Island).
- Added `ProcessingStatus` enumeration detailing why the result state was empty or uncertain.
- Improved barcode error detection and correction.
- Tweaked document detection feedback thresholds (that let the user know when the document is too close or too far away). This allows for a more natural scanning experience of passports in landscape mode, as the document can now be closer to the camera.

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
