# Release notes

## 5.11.1

* We've fixed a broken `rollup.config.js` which resulted in unusable UMD development bundle

## 5.11.0

### Breaking changes

* We've changed the way how recognizer options are set up when using the UI component
    * You can now specify how a recognizer should behave by using the new `recognizerOptions` property.
    * To see the full list of available recognizer options, as well as examples on how to use them, check out the [relevant source code](ui/src/components/blinkid-in-browser/blinkid-in-browser.tsx).
* We've removed property and attribute `anonymization` from the UI component since it can now be defined with the new `recognizerOptions` property

### Newly supported identity documents:

We’ve added 98 new documents:

#### Europe

* Albania - Driver Card (front only)
* Albania - Professional Driver License (front only)
* Belarus - Driver License (front only, beta)
* Belgium - Minors ID (beta)
* Czechia - Residence Permit
* Finland - Alien ID
* Finland - Residence Permit (beta)
* Georgia - Driver License (front only)
* Greece - Residence Permit
* Ireland - Passport Card (beta)
* Ireland - Public Services Card (beta)
* Kosovo - Driver License (front only, beta)
* Latvia - Alien ID
* Luxembourg - ID Card
* Moldova - ID Card (beta)
* North Macedonia - Driver License (front only)
* North Macedonia - ID Card
* Poland - Passport (beta)
* Slovenia - Residence Permit (beta)
* Spain - Alien ID
* UK - Passport (beta)

#### Middle East and Africa

* Algeria - Driver License
* Burkina Faso - ID Card (front only)
* Cameroon - ID Card (beta)
* Democratic Republic Of The Congo - Driver License (front only, beta)
* Egypt - Driver License (beta)
* Ghana - ID Card (beta)
* Iraq - ID Card (beta)
* Ivory Coast - Driver License (front only, beta)
* Ivory Coast - ID Card
* Lebanon - ID Card (beta)
* Morocco - Driver License
* Mozambique - Driver License (front only, beta)
* Oman - Driver License (beta)
* Rwanda - ID Card (front only)
* Senegal - ID Card
* Tanzania - Driver License (front only, beta)
* Tunisia - Driver License (front only)
* Uganda - Driver License (front only, beta)

#### Latin America & the Caribbean

* Argentina - Alien ID (beta)
* Bahamas - ID Card (front only, beta)
* Bolivia - Minors ID (beta)
* Jamaica - Driver License
* Mexico - Residence Permit (beta)
* Mexico - Chiapas - Driver License (front only)
* Mexico - Coahuila - Driver License (beta)
* Mexico - Durango - Driver License(front only, beta)
* Mexico - Guerrero-cocula - Driver License (beta)
* Mexico - Guerrero-juchitan - Driver License (beta)
* Mexico - Guerrero-tepecoacuilco - Driver License (front only, beta)
* Mexico - Guerrero-tlacoapa - Driver License (front only, beta)
* Mexico - Hidalgo - Driver License
* Mexico - Mexico - Driver License (beta)
* Mexico - Morelos - Driver License (front only)
* Mexico - Oaxaca - Driver License
* Mexico - Puebla - Driver License (front only, beta)
* Mexico - San Luis Potosi - Driver License (front only)
* Mexico - Sinaloa - Driver License (front only, beta)
* Mexico - Sonora - Driver License (beta)
* Mexico - Tabasco - Driver License (beta)
* Mexico - Yucatan - Driver License (beta)
* Mexico - Zacatecas - Driver License (beta)
* Panama - Temporary Residence Permit (beta)
* Peru - Minors ID (beta)
* Trinidad And Tobago - Driver License (front only, beta)
* Trinidad And Tobago - ID Card

#### Oceania

* Australia - South Australia - Proof Of Age Card (front only, beta)

#### Asia

* Armenia - ID Card
* Bangladesh - Driver License (beta)
* Cambodia - Driver License (front only, beta)
* India - Gujarat - Driving Licence (front only, beta)
* India - Karnataka - Driving Licence (front only, beta)
* India - Kerala - Driving Licence (beta)
* India - Madhya Pradesh - Driving Licence (front only, beta)
* India - Maharashtra - Driving Licence (front only, beta)
* India - Punjab - Driving Licence (front only, beta)
* India - Tamil Nadu - Driving Licence (beta)
* Kyrgyzstan - ID Card
* Malaysia - Mypolis (beta)
* Malaysia - Refugee ID (front only)
* Myanmar - Driver License (beta)
* Pakistan - Punjab - Driving Licence (front only, beta)
* Sri Lanka - Driving Licence (front only)
* Thailand - Alien ID (front only)
* Thailand - Driver License (beta)
* Uzbekistan - Driver License (front only, beta)

#### Northern America

* Canada - Tribal ID (beta)
* Canada - Nova Scotia - ID Card (beta)
* Canada - Saskatchewan - ID Card (beta)
* USA - Border Crossing Card (front only)
* USA - Global Entry Card (beta)
* USA - Nexus Card (beta)
* USA - Veteran ID (front only)
* USA - Work Permit
* USA - Mississippi - ID Card (beta)
* USA - Montana - ID Card
* USA - New Mexico - ID Card (beta)
* USA - Wisconsin - ID Card (beta)

#### Back side support added:

* Hungary - Residence Permit
* Luxembourg - Residence Permit (no longer beta)
* Mauritius - ID Card
* Colombia - Alien ID (no longer beta)
* Mexico - Baja California - Driver License
* Mexico - Chihuahua - Driver License
* Mexico - Guanajuato - Driver License
* Mexico - Michoacan - Driver License
* Malaysia - MyKid
* Malaysia - MyPR

#### No longer beta:

* Albania - Passport
* Malta - Residence Permit
* Switzerland - Residence Permit
* Bolivia - Driver License
* Chile - Passport
* El Salvador - ID Card
* Peru - ID Card
* Singapore - S Pass (front only)

### Changes to the BlinkId(Combined)Recognizer

* You can now retrieve an image of the document owner along with cropped images of the document itself whenever you’re scanning an AAMVA-compliant ID: 
    * Using `BarcodeId` as a `RecognitionMode` lets you scan US driver licenses and IDs that BlinkID can’t read from the Visual Inspection Zone (VIZ) alone. Use it to extract:
        * A face image from the front side
        * Barcode data from the back side
        * Cropped document images of both sides
    * You can disable this `RecognitionMode` by setting `enableBarcodeId` to `false` in the `RecognitionModeFilter`.
* We've improved data extraction through the MRZ:
    * We now allow standard M/F values for gender on Mexican documents (along with localized H/M values)
* We're now converting dates to the Gregorian calendar for:
    * Taiwan documents with Republic of China (ROC) calendar dates
    * Saudi documents with Islamic calendar dates
* We're now auto-filling all ‘partial’ dates found on identity documents (showing year or month-year only):
    * Date of issue will be converted to the first day of the (first) month
        * E.g. '1999' will be converted to '01.01.1999.'
        * E.g. '03.1999.' will be converted to '01.03.1999.'
    * Date of expiry will be converted to the last day of the (last) month
        * E.g. '1999' will be converted to '31.12.1999.'
        * E.g. '03.1999.' will be converted to '31.03.1999.'

### Changes to the UI component

* You can now scan identity documents with barcodes, for example US driver’s licenses, with BlinkId(Combined)Recognizer
    * A user will now receive a feedback message whenever barcode scanning is taking place, with instructions to point the camera closer to the barcode, if needs be.
    * This change should result in better results when scanning the aforementioned documents.

### Performance improvements

* We've added three different flavors of WebAssembly builds to the SDK, to provide better performance across all browsers
    * Unless defined otherwise, the SDK will load the best possible bundle during initialization:
        * `Basic` Same as the existing WebAssembly build, most compatible, but least performant.
        * `Advanced` WebAssembly build that provides better performance but requires a browser with advanced features.
        * `AdvancedWithThreads` Most performant WebAssembly build which requires a proper setup of COOP and COEP headers on the server-side.
    * For more information about different WebAssembly builds and how to use them properly, check out the [relevant section](README.md/#deploymentGuidelines) in our official documentation

### Bugfixes

* We fixed the initialization problem that prevented the SDK from loading on iOS 13 and older versions

## 5.10.2

* Constructor of `VideoRecognizer` class is now public

## 5.10.1

* It's now possible to define anonymization mode when using UI component
    * The default value of anonymization mode is `AnonymizationMode.FullResults` which means certain documents are anonymized by default.
    * To change default value set attribute/property `anonymization` to one of supported values `None`, `ImageOnly`, `ResultFieldsOnly` or `FullResult`.

## 5.10.0

**Newly supported identity documents**

* Saudi Arabia - DL (front)
* Saudi Arabia - Resident ID (front)

### Changes to the BlinkId(Combined)Recognizer:

* We're now able to extract the additional address on Hungary Address Cards
* We've improved data extraction through the MRZ:
    * We now return the document type through `ClassInfo`, regardless of the `RecognitionMode` you're using (`MrzId`, `MrzPassport` or `MrzVisa`).
    * This means you can now use `ClassFilter` to filter these documents by their type.
    * We now return the document number on Nigeria IDs complete with its check digit.
    * We now support Italy Residence Permits with a *CR* document code.
* We've extended the `ClassInfo` structure with helper methods so you can filter documents by country more easily:
    * Use `countryName`, `isoNumericCountryCode`, `isoAlpha2CountryCode` and `isoAlpha3CountryCode` to get the full country names or their representative codes, as defined by [ISO](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes).
* We've extended the `BarcodeResult` structure with `extendedElements`
    * You can find all data from AAMVA-compliant barcodes under their respective `BarcodeElementKey` in the `BarcodeElements` structure.
    * For a full list of keys please see [here](src/Recognizers/BlinkID/Generic/BarcodeResult.ts#L91).
* We've added another `ProcessingStatus` called `AwaitingOtherSide`
    * This status is triggered once BlinkID has finished with the first side of a document and expects the other side, too.
* We're now able to extract the date of birth from the CURP field on Mexico Voter IDs
* We've added a new recognition mode for recognizing still images of documents that have already been cropped:
    * Set the `scanCroppedDocumentImage` to true when you're feeding BlinkID images of documents that have already been cropped and don't require detection.
    * Keep in mind that this setting won't work on document images that haven't been properly cropped.

### Changes to the IdBarcodeRecognizer:

* We've extended the results with `extendedElements`
    * You can find all data from AAMVA-compliant barcodes under their respective `BarcodeElementKey` in the `BarcodeElements` structure.
    * For a full list of keys please see [here](src/Recognizers/BlinkID/Generic/BarcodeResult.ts#L91).

### Deprecated recognizers:

* We've deprecated `UsdlRecognizer`. Please use `IdBarcodeRecognizer` instead

### Changes to the UI component:

* We’ve added new ways you can configure the UI component to better fit the way your app looks and behaves.
    * For a full list of attributes, properties and events you can modify, please see the [API documentation](ui/docs/components/blinkid-in-browser/readme.md).
    * For a full list of CSS variables please see [\_globals.scss file](ui/src/components/shared/styles/_globals.scss).

### Changes to RecognizerRunner class:

* Invoking `RecognizerRunner.processImage` on  multiple still images will no longer implicitly reset the recognizer chain.
    * This means you can now use BlinkIdCombinedRecognizer to scan both sides of a document by giving it two still images.
    * If you still need to reset the recognizers, you can do that  manually by invoking the `RecognizerRunner.resetRecognizers` function.
    * A complete example of how to use BlinkIdCombinedRecognizer with still images has been added [here](examples/combined-file).

## 5.9.1

* We've fixed NPM package which had obsolete UI component

## 5.9.0

### New additions to our supported documents list

- 53 documents added:

    - ALBANIA - DL (front)
    - BELGIUM - RESIDENCE PERMIT (front, back)
    - BOLIVIA - ID (front, back)
    - BOSNIA AND HERZEGOVINA - PASSPORT
    - CAMBODIA - PASSPORT
    - CANADA - RESIDENCE PERMIT (front, back)
    - CANADA - MANITOBA - ID (front)
    - CANADA - ONTARIO - HEALTH INSURANCE CARD (front)
    - CHILE - ALIEN ID (front, back)
    - CHINA - ID (front, back)
    - COLOMBIA - MINORS ID (front, back)
    - CYPRUS - RESIDENCE PERMIT (front, back)
    - CZECHIA - PASSPORT
    - GREECE - ID (front)
    - HAITI - ID (front, back)
    - ITALY - RESIDENCE PERMIT (front, back)
    - LATVIA - DL (front)
    - LATVIA - PASSPORT
    - LITHUANIA - PASSPORT
    - LUXEMBOURG - DL (front)
    - MONTENEGRO - DL (front)
    - MONTENEGRO - ID (front, back)
    - MONTENEGRO - PASSPORT
    - NETHERLANDS - RESIDENCE PERMIT (front, back)
    - NICARAGUA - ID (front, back)
    - NIGERIA - ID (front, back)
    - NORWAY - RESIDENCE PERMIT (front, back)
    - OMAN - RESIDENT ID (front, back)
    - PARAGUAY - DL (front, back)
    - PERU - DL (front, back)
    - PHILIPPINES - SOCIAL SECURITY CARD (front)
    - ROMANIA - PASSPORT
    - RUSSIA - PASSPORT
    - SERBIA - PASSPORT
    - SLOVAKIA - PASSPORT
    - SLOVENIA - PASSPORT
    - SOUTH KOREA - DL (front)
    - SPAIN - RESIDENCE PERMIT (front, back)
    - SWEDEN - RESIDENCE PERMIT (front, back)
    - THAILAND - PASSPORT
    - UKRAINE - DL (front)
    - UKRAINE - PASSPORT
    - USA - ARKANSAS - ID (front, back)
    - USA - CONNECTICUT - ID (front, back)
    - USA - GREEN CARD (front, back)
    - USA - MARYLAND - ID (front, back)
    - USA - MINNESOTA - ID (front, back)
    - USA - NEVADA - ID (front, back)
    - USA - NEW YORK CITY - ID (front, back)
    - USA - TEXAS - WEAPON PERMIT (front)
    - USA - VIRGINIA - ID (front, back)
    - VENEZUELA - DL (front)
    - VENEZUELA - PASSPORT

- Beta support added for 46 documents:
    - ALBANIA - PASSPORT
    - BAHAMAS - DL (front)
    - BERMUDA - DL (front)
    - BOLIVIA - DL (front)
    - CHILE - DL (front)
    - COLOMBIA - ALIEN ID (front)
    - DENMARK - RESIDENCE PERMIT (front, back)
    - DOMINICAN REPUBLIC - DL (front, back)
    - ECUADOR - DL (front)
    - EL SALVADOR - DL (front, back)
    - ESTONIA - RESIDENCE PERMIT (front, back)
    - GUATEMALA - DL (front, back)
    - HAITI - DL (front)
    - HONDURAS - DL (front, back)
    - HONDURAS - ID (front, back)
    - HUNGARY - ADDRESS CARD (front, back)
    - HUNGARY - RESIDENCE PERMIT (front)
    - ICELAND - DL (front)
    - ISRAEL - ID (front, back)
    - JAPAN - DL (front)
    - JORDAN - DL (front)
    - LATVIA - ALIEN PASSPORT
    - LATVIA - RESIDENCE PERMIT (front, back)
    - LUXEMBOURG - RESIDENCE PERMIT (front)
    - MALTA - RESIDENCE PERMIT (front, back)
    - MEXICO - BAJA CALIFORNIA - DL (front)
    - MEXICO - CHIHUAHUA - DL (front)
    - MEXICO - CIUDAD DE MEXICO - DL (front)
    - MEXICO - PROFESSIONAL DL (front)
    - MEXICO - GUANAJUATO - DL (front)
    - MEXICO - MICHOACAN - DL (front)
    - MEXICO - TAMAULIPAS - DL (front, back)
    - MEXICO - VERACRUZ - DL (front, back)
    - PHILIPPINES - TAX ID (front)
    - PHILIPPINES - VOTER ID (front)
    - POLAND - RESIDENCE PERMIT (front, back)
    - PORTUGAL - RESIDENCE PERMIT (front, back)
    - PUERTO RICO - VOTER ID (front)
    - SLOVAKIA - RESIDENCE PERMIT (front, back)
    - SOUTH KOREA - ID (front)
    - SWITZERLAND - RESIDENCE PERMIT (front, back)
    - TAIWAN - TEMPORARY RESIDENCE PERMIT (front)
    - TURKEY - RESIDENCE PERMIT (front)
    - USA - KANSAS - ID (front, back)
    - VENEZUELA - ID (front)
    - VIETNAM - DL (front)

- Added back side support for 7 documents:
    - ARGENTINA - ID
    - ECUADOR - ID
    - FINLAND - ID
    - NIGERIA - DL
    - QATAR - RESIDENCE PERMIT
    - URUGUAY - ID
    - USA - NEW YORK - DL

- 9 documents are no longer beta:
    - BRAZIL - DL
    - CANADA - ALBERTA - ID
    - MALAYSIA - MyKAS
    - MEXICO - NUEVO LEON - DL
    - PANAMA - DL
    - PORTUGAL - DL
    - SAUDI ARABIA - ID
    - SRI LANKA - ID
    - USA - IDAHO - ID

### New features and updates to the BlinkId(Combined)Recognizer

*   We’re now able to read partial MRZ formats (2.5 lines), like the ones found on Switzerland and Liechtenstein DLs.
*   We’ve added `**documentOptionalAdditionalNumber**` to the main part of the result, as well as front and back side VIZ results.
*   We’ve expanded the set of possible recognizer states with `**StageValid**`. This state fixes `BlinkIDCombinedRecognizer` timeout issues, and enables better control of the Combined scanning pipeline. It activates when the first side of a document has been successfully scanned and scanning of the second side is required.

### Camera management updates

* We've enabled camera image flipping
    * Method `flipCamera` has been added to [`VideoRecognizer`](src/MicroblinkSDK/VideoRecognizer.ts).
    * You can now let your users mirror the camera image vertically.
    * By default, the UI component will display a flip icon in the top left corner once the camera is live.
* We've improved camera management on devices with multiple cameras
    * Method `createVideoRecognizerFromCameraStream` has been extended in [`VideoRecognizer` class](src/MicroblinkSDK/VideoRecognizer.ts).
    * Attribute `[camera-id]` has been added to the UI component so that your users can preselect their desired camera.

### Fixes

* We’ve fixed an uncommon bug where you’d get incomplete results upon scanning of the MRZ with the `allowUnparsed` setting enabled.
* We've fixed a problem where the UI component would interfere with navigation strategy in SPA frameworks.
    * Value of the `href` attribute in button elements has been changed to `javascript:void(0)`.

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
