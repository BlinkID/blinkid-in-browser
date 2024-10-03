# Release notes

## 6.11.0

### Expanded Document Coverage

#### New Documents Support

-   Armenia - Paper Passport
-   Bahamas - Temporary Residence Permit
-   Bahamas - Work Permit
-   Bangladesh - Polycarbonate Passport
-   Comoros - Paper Passport
-   Dominican Republic - Non Voter ID
-   Greece - Polycarbonate Passport
-   Jamaica - Voter ID
-   Kazakhstan - Paper Passport
-   Kyrgyzstan - Paper Passport
-   Kyrgyzstan - Polycarbonate Passport
-   Lebanon - Driver's License
-   Tajikistan - Identity Card
-   Turkmenistan - Polycarbonate Passport
-   Uzbekistan - Identity Card

#### New Document Versions for Supported Documents

-   Argentina - Alien ID
-   Bulgaria - Identity Card
-   Canada, British Columbia - Identity Card
-   Canada, British Columbia - Minors Public Services Card
-   Croatia - Driver's License
-   Jamaica - Paper Passport
-   Malaysia - i-Kad
-   Mexico, Coahuila - Driver's License
-   Montenegro - Driver's License
-   Namibia - Identity Card
-   Norway - Driver's License
-   Pakistan - Proof of Registration
-   Panama - Identity Card
-   Panama - Residence Permit
-   Peru - Minors ID
-   Portugal - Identity Card
-   Romania - Identity Card
-   Trinidad and Tobago - Driver's License
-   Turkey - Identity Card
-   USA, Arizona - Identity Card
-   USA, Colorado - Identity Card
-   USA, Michigan - Identity Card
-   USA, Mississippi - Driver's License
-   USA, Mississippi - Identity Card
-   USA, Montana - Identity Card
-   USA, North Carolina - Identity Card
-   USA, North Carolina - Driver's License
-   USA, North Dakota - Driver's License
-   USA, Vermont - Identity Card
-   USA, Virginia - Identity Card
-   USA, Wyoming - Driver's License
-   USA, Wyoming - Identity Card
-   Uzbekistan - Paper Passport

#### New Beta Documents Support

-   Andorra - Paper Passport
-   Andorra - Polycarbonate Passport
-   Philippines - Driver's License
-   Armenia - Work Permit
-   Australia - Asic Card
-   Azerbaijan - Driver's License
-   Bahamas - Paper Passport
-   Bahamas - Polycarbonate Passport
-   Cayman Islands - Paper Passport
-   Cayman Islands - Polycarbonate Passport
-   Cayman Islands - Voter ID
-   Gibraltar - Driver's License
-   Gibraltar - Identity Card
-   Gibraltar - Paper Passport
-   Gibraltar - Polycarbonate Passport
-   Guyana - Paper Passport
-   Kuwait - Bidoon Card
-   Kyrgyzstan - Driver's License
-   Monaco - Paper Passport
-   Pakistan - Afghan Citizen Card
-   Philippines, Bangsamoro - Driver's License
-   Saint Lucia - Driver's License
-   Saint Lucia - Paper Passport
-   San Marino - Polycarbonate Passport
-   Turks and Caicos Islands - Driver's License
-   Turks and Caicos Islands - Identity Card
-   Turks and Caicos Islands - Paper Passport
-   Australia - Interim Health Insurance Card
-   Australia - Reciprocal Health Insurance Card
-   UAE - Vehicle Registration

#### New Document Versions for Beta-Supported Documents

-   Barbados - Identity Card
-   Brazil - Paper Passport
-   Dominican Republic - Driver's License
-   India, Gujarat - Driver's License
-   Mexico, Puebla - Driver's License
-   Philippines - Tax ID
-   Philippines - Health Insurance Card
-   Australia - Health Insurance Card

#### New Segments Supported on Documents

-   USA - Green Card - `eligibilityCategory`
-   USA - Work Permit - `eligibilityCategory`
-   Greece - Driver's License - `placeOfBirth` (greek and latin)
-   Saudi Arabia - Resident ID - `nationality` (arabic)
-   Bahrain - `dateOfExpiry`
-   USA - Driver's license & ID card - `specificDocumentValidity`
-   Pakistan - Proof of Registration - `DependentDateOfBirth`, `DependentSex`, `DependentDocumentNumber` & `DependentFullName`

### Renamed segments

-   Barbados - Identity Card - `personalIdNumber` -> `documentNumber`
-   Panama - Identity Card - `personalIdNumber` -> `documentNumber`
-   Panama - Residence Permit - `personalIdNumber` -> `documentNumber`

### New Features

-   **Greek Alphabet Support**
    -   We’ve added support for extracting `Place of Birth` in both Greek and Latin scripts.
-   API changes in `BlinkIdSingleSideRecognizer` and `BlinkIdMultiSideRecognizer`:
    -   new fields in result: `manufacturingYear`, `vehicleType`, `eligibilityCategory`, `specificDocumentValidity`, `dependentsInfo`
    -   new values in `ClassInfo` enums:
        -   Region: `BANGSAMORO`
        -   Type: `ASIC_CARD`, `BIDOON_CARD`, `INTERIM_HEALTH_INSURANCE_CARD`, `NON_VOTER_ID`, `RECIPROCAL_HEALTH_INSURANCE_CARD`, `VEHICLE_REGISTRATION`
    -   new values in `FieldType` enum: `ManufacturingYear`, `VehicleType`, `DependentDateOfBirth`, `DependentSex`, `DependentDocumentNumber`, `DependentFullName`, `EligibilityCategory`, `SpecificDocumentValidity`

## 6.10.1

-   Barcode scanning is now optional for Paraguay ID documents.

## 6.10.0

### New features

-   **Improved reliability and first-time successful scanning experience**
    -   **_Avoiding Double Scans of the Front Side_**: For a more reliable scanning process, BlinkID now prompts users to flip the document when they scan the front side twice. This improves the overall experience and reduces the chance of mistakes.
    -   **_Starting with the Right Side_**: If users attempt to scan the back side of a document first, BlinkID will prompt them to begin with the front side. This feature ensures that users follow the correct order, leading to a more reliable and user-friendly experience.

### Expanded document coverage

#### New document versions for supported documents

-   Sweden - Social Security Card - Back side
-   Bolivia - Driver's License - Back side
-   Brazil, Distrito Federal - Identity Card - Back side

#### Out of beta

-   Colombia - Temporary Protection Permit

#### New beta documents support

-   France - Professional ID
-   Mexico - Tax ID

#### New document versions for beta-supported documents

-   Brazil, Parana - Identity Card - Back side
-   Brazil, Santa Catarina - Identity Card - Back side

#### New segments supported on documents

-   Peru - Alien ID - MRZ

### Other changes

-   Added `imageExtractionFailures` to `AdditionalProcessingInfo` - this allows clients to actively track if any `ImageExtractionType` (`FullDocument`, `Face`, `Signature`) is not visible on the presented document.
-   Added a new result member, `barcodeStepUsed`, to both `BlinkIdSingleSideRecognizer` and `BlinkIdMultiSideRecognizer`. This member indicates whether the barcode scanning step was utilized during the process.
-   Added two new settings for `BlinkIdSingleSideRecognizer` and `BlinkIdMultiSideRecognizer`:
    -   `allowBarcodeScanOnly` - allows barcode recognition to proceed even if the initial extraction fails - set to `false` by default
    -   `combineFrameResults` - enables the aggregation of data from multiple frames - set to `true` by default

## 6.9.2

-   added new member `barcodeStepUsed` to `BlinkIDSingleSideRecognizer` and `BlinkIDMultiSideRecognizer` results
-   improved barcode scanning

## 6.9.1

-   Fixes iOS camera selection logic when the system locale is set to Spanish

## 6.9.0

### New features

**Custom mandatory fields**

-   We’re introducing the option for customers to define their own set of mandatory fields. This feature allows greater flexibility in the scanning process by enabling the extraction of only the necessary information from identity documents. Now you can customize the process and focus on only those fields that are relevant to your use case.
-   Custom mandatory fields can be set at the document level or applied universally to all document types.

### Expanded Document Coverage

#### New Documents Support

-   Austria - Polycarbonate Passport
-   Canada - Polycarbonate Passport
-   Ecuador - Paper Passport
-   Germany - eID
-   Guatemala - Alien ID
-   Iraq - Polycarbonate Passport
-   Namibia - Identity Card
-   Nepal - Polycarbonate Passport
-   Sweden - SIS ID
-   USA, Delaware - Identity Card
-   USA, Louisiana - Identity Card
-   USA, Vermont - Identity Card

#### New Document Versions for Supported Documents

-   Bolivia - Identity Card
-   Canada, British Columbia - Public Services Card
-   Finland - Identity Card
-   Greece - Identity Card
-   Malaysia - iKAD
-   Mexico, Nuevo Leon - Driver's License
-   Mexico, Tlaxcala - Driver's License
-   Morocco - Driver's License
-   Thailand - Polycarbonate Passport
-   USA - Alaska - Driver's License
-   USA - Alaska - Identity Card
-   USA - Connecticut - Identity Card
-   USA - Delaware - Driver's License
-   USA - District of Columbia - Driver's License
-   USA - Hawaii - Identity Card
-   USA - Idaho - Driver's License
-   USA - Indiana - Driver's License
-   USA - Indiana - Identity Card
-   USA - Iowa - Identity Card
-   USA - Kansas - Identity Card
-   USA - Kentucky - Identity Card
-   USA - Kentucky - Driver's License
-   USA - Maine - Identity Card
-   USA - Maine - Driver's License
-   USA - Michigan - Driver's License
-   USA - Minnesota - Driver's License
-   USA - Minnesota - Identity Card
-   USA - Montana - Identity Card
-   USA - Montana - Driver's License
-   USA - New Hampshire - Identity Card
-   USA - New Mexico - Driver's License
-   USA - New Mexico - Identity Card
-   USA - New York - Identity Card
-   USA - North Dakota - Identity Card
-   USA - Oregon - Identity Card
-   USA - Pennsylvania - Driver's License
-   USA - Rhode Island - Identity Card
-   USA - South Carolina - Identity Card
-   USA - Vermont - Driver's License
-   USA - Washington - Identity Card
-   USA - Wyoming - Driver's License
-   USA - Wyoming - Identity Card

#### Out of Beta

-   European Union - Health Insurance Card

#### New Beta Documents Support

-   Democratic Republic of the Congo - Voter ID
-   Philippines - Alien ID
-   Philippines - Postal ID
-   Philippines - Work Permit
-   Philippines - Health Insurance Card

#### New Document Versions for Beta-Supported Documents

-   Honduras - Paper Passport
-   Mexico, Sonora - Driver's License
-   Peru - Alien ID
-   Philippines - Alien ID

#### New Segments Supported on Documents

-   China Exit Entry Permit - MRZ
-   China Mainland Travel Permit Taiwan - MRZ
-   France Residence permit - `Remarks` & `ResidencePermitType`
-   Philippines Alien ID - `visaType`

#### Bug Fixes

-   German ID - Fixed issues in cases when documents contain multiple surnames.
-   Paraguay ID - Added support for parsing the smaller barcode found on the back side of the ID.
-   Bulgaria Driver’s License - The Address field is set to optional, improving the extraction process.
-   Improved MRZ parsing for the back side of the following identity documents:
    -   Brazil Alien ID
    -   Kenya ID
    -   Bosnia and Herzegovina ID
    -   Ivory Coast ID
    -   Paraguay ID

### API changes

-   `ClassAnonymizationSettings` type now uses `classFilter` property of type `ClassFilter` instead of `country`, `region` and `type` properties

-   New result members: `remarks`, `residencePermitType` and `visaType` added to `BlinkIdMultiSideRecognizerResult`, `BlinkIdSingleSideRecognizerResult` and `VIZResult`

-   New field types: `Remarks`, `ResidencePermitType` and `VisaType` to `FieldType` enum

-   Added new enum `AlphabetType`

-   Added new type `DetailedFieldType`

-   Added new type `ClassFilter`

-   Added new type `CustomClassRules`

-   Added new settings `customClassRules` as an array of `CustomClassRules` types for defining custom mandatory fields

-   Added new region: `ALAGOAS` to `Region` enum

-   Added new document types: `AFGHAN_CITIZEN_CARD`, `EID`, `PASS`, `SIS_ID` to `DocumentType` enum

## 6.8.0

### New Features

-   BlinkID now extracts precise information about subtypes of driver’s licenses and ID cards (e.g., conditional driver’s license, learner’s permit, provision, enhanced, etc.). This information is included in the scanning results as a `documentSubtype` field allowing you to tailor workflows or processes based on document limitations.

#### Bugfixes

-   Fixed data match for Paraguay ID 2023 to cover inconsistencies between the MRZ and Visual Inspection Zone (VIZ)

## 6.7.2

### Bugfix

-   Fixes an issue introduced in 6.7.1 where the UI component overlay would not hide after finishing a scanning session.

## 6.7.1

### New Features

#### Improved blur and glare detection

-   `enableBlurFilter` and `enableGlareFilter` properties have been added on BlinkID recognizer settings. These are enabled by default, but users can turn them off if they want to allow blur and glare on captured frames.

-   `blurStrictnessLevel` and `glareStrictnessLevel` properties have been added on BlinkID recognizer settings. These can be configured using the `StrictnessLevel` enum, which can be `Strict`, `Normal` (default) or `Relaxed`.

-   New properties `ImageAnalysisResult`:
    -   `blurDetected` and `glareDetected`

#### Bug fixes

-   A bug that caused memory leaks when reconfiguring the recognizer runner has been fixed
-   The barcode scanning step feedback is now properly displayed in the UI component
-   Improved camera selection algorithm

#### Breaking changes ⚠️

-   `allowBlurFilter` has been renamed to `enableBlurFilter`
-   The `blurred` property on `ImageAnalysisResult` has been renamed to `blurDetected`

## 6.7.0

### New Features

-   **Real ID symbol detection on US driver's license**
    -   BlinkID can now identify Real ID symbols from US driver’s licenses, providing feedback on their presence or absence. This ensures customers can quickly determine if a Real ID symbol is available on a scanned US driver’s license to be compliant with Real ID regulations.
-   **UX Improvements**
    -   Extended duration for UI messages
    -   UI messages now remain visible for a longer time after scanning, improving user experience. Users can now review post-scanning messages at a comfortable pace, leading to a smoother process.
    -   Success indicator for front side capture
        -   BlinkID now displays a clear success indicator after scanning the front side of a document. This visual cue enhances user confidence by providing immediate feedback during the scanning process.
-   **Partial anonymization of the "Document Number"**
    -   To ensure user privacy and security, BlinkID now offers the option of partially anonymizing the document number from the scanned document.
-   **Mandatory Barcode Presence on US documents**
    -   To minimize the cases of capturing the front side of the document as the back frame in the results, BlinkID now requires the presence of a barcode before saving the back frame on US documents. Processing status `BarcodeDetectionFailed` is returned when the mandatory barcode is not present on the back of US documents.

### Minor API changes

-   Added `BarcodeDetectionFailed` as a new `ProcessingStatus`
    -   This status is triggered once the barcode was not found on the image. This processing status can only occur if the document has the mandatory barcode.
-   Added new boolean member `realIdDetectionStatus` to the `ImageAnalysisResult`. If `true`, Real ID symbol is present, `false` otherwise.
-   Added new member `documentNumberAnonymizationSettings` to the `ClassAnonymizationSettings` for seamless integration with the document number anonymization feature.

#### Bug Fixes

-   Updated internal mapping for Myanmar Passports to display nationality as "Myanmarese" instead of "Burmese" on Myanmar passports.
-   On Peru ID "Date of Issue" is marked optional, offering customers more flexibility in capturing ID information.
-   Improved "Date of Expiry" handling logic for MRZ in cases where documents with a date of expiry year 1969 were not correctly sanitized.

## 6.6.0

### Document Updates

#### New Documents Support:

-   Australia - Polycarbonate Passport
-   Indonesia - Polycarbonate Passport
-   Mexico - Consular Voter ID
-   Moldova - Polycarbonate Passport
-   Pakistan - Proof Of Registration
-   Panama - Polycarbonate Passport
-   USA - West Virginia - ID Card

#### New Beta Documents Support:

-   Brazil - Ceara - ID Card
-   Brazil - Goias - ID Card
-   Brazil - Sergipe - ID Card
-   China - Exit Entry Permit
-   China - Mainland Travel Permit Taiwan
-   Colombia - Temporary Protection Permit
-   India - DL
-   India - Andhra Pradesh - DL
-   India - Haryana - DL
-   European Union - Health Insurance Card

#### New Document Versions for Supported Documents:

-   Australia - Queensland - DL
-   Australia - Victoria - DL
-   Australia - Western Australia - DL
-   Bolivia - Minor's ID
-   Brazil - Alien ID
-   Estonia - DL
-   Finland - Alien ID
-   Guatemala - Paper Passport
-   India - Paper Passport - New side type
-   Malta - DL
-   Mexico - Guanajuato - DL
-   Mexico - San Luis Potosi - DL
-   New Zealand - Polycarbonate Passport
-   Paraguay - ID Card
-   Slovenia - Residence Permit
-   USA - Green Card
-   USA - Work Permit
-   USA - Arizona - ID Card
-   USA - Colorado - DL
-   USA - Colorado - ID Card
-   USA - District of Columbia - DL
-   USA - District of Columbia - ID Card
-   USA - Idaho - DL
-   USA - Idaho - ID Card
-   USA - Missouri - ID Card
-   USA - Nebraska - ID Card
-   USA - Nevada - ID Card
-   USA - New York - ID Card
-   USA - North Dakota - DL
-   USA - Oklahoma - ID Card
-   USA - Pennsylvania - ID Card
-   USA - Utah - ID Card
-   USA - Virginia - DL
-   USA - Virginia - ID Card
-   USA - West Virginia - DL
-   USA - Wisconsin - DL
-   USA - Wisconsin - ID Card

#### New Document Versions for Beta Supported Documents:

-   Australia - Queensland - Proof of Age Card
-   Brazil - ID Card
-   Ireland - Residence Permit
-   Mexico - Consular ID
-   Mexico - Residence Permit
-   Mexico - Nayarit - DL
-   USA - North Dakota - ID Card

#### Out of Beta:

-   Croatia - Residence Permit
-   Moldova - Paper Passport

### Platform Updates

-   Expanded geographic support with new `Region` enum values:

    -   `ANDHRA_PRADESH`
    -   `CEARA`
    -   `GOIAS`
    -   `GUERRERO_ACAPULCO_DE_JUAREZ`
    -   `HARYANA`
    -   `SERGIPE`

-   Document recognition enhanced with new `Type` enum values:

    -   `EXIT_ENTRY_PERMIT`
    -   `MAINLAND_TRAVEL_PERMIT_TAIWAN`
    -   `NBI_CLEARANCE`
    -   `PROOF_OF_REGISTRATION`
    -   `TEMPORARY_PROTECTION_PERMIT`

-   Data extraction improvements:
    -   Added `Sponsor` and `BloodType` result fields to `BlinkIdMultiSideRecognizer.Result`, `BlinkIdSingleSideRecognizer.Result` and `VizResult`

## 6.5.2

Fixed issue with improper packaging.

## v6.5.1

### Lightweight builds

This release contains multiple builds tailored for different devices' capabilities.

These builds are:

#### Full

Regular build that has barcode deblurring models. This build is loaded automatically on desktop devices.

#### Lightweight

Build without deblurring models. This build is loaded automatically on mobile devices. Deblurring models are usually not necessary due to better quality cameras compared to front-facing laptop cameras.

These builds each contain previous build variants present so far: basic, advanced with SIMD and advanced with multithreading making a total of 6 possible builds.

These builds can be overridden by using a new property on the settings objects `WasmSDKLoadSettings.blinkIdVariant`:

```ts
export type BlinkIDVariant = "full" | "lightweight";
```

These can also be set on the UI component via the `blinkIdVariant` prop.

### Dynamic webassembly memory management

Depending on the device used, the SDK will allocate different amounts of memory on startup.
This is primarily used as a mitigation mechanism for iOS's memory management, which often blocks webassembly memory growth.

Although it's not recommended, this can be overridden using `WasmSDKLoadSettings.initialMemory`.

### Other fixes:

-   Fixed an issue where certain iOS devices would display a zoomed in preview.
-   Improved scanning of Bolivia IDs by addressing cases where the expiration date is covered by a signature, allowing the completion of the scanning process.

## 6.5.0

### New features

-   Improved the document side detection for US driver's licenses which reduces the possibility of capturing the wrong side of the document

### Breaking changes

-   It's now mandatory to scan the barcode when scanning the back side of US driver's licences using the BlinkID Multi Side Recognizer

### Bugfixes

-   Fixed a bug where settings weren't updated correctly when set via the UI component
-   Fixed data matching issue in Guatamala Passport

## v6.4.0

### New features

-   Added new result member `cardRotation` to `ImageAnalysisResult` structure

-   New `CardOrientation` status - `NotAvailable`

-   New `Region` enum values:

    -   DISTRITO_FEDERAL
    -   MARANHAO
    -   MATO_GROSSO
    -   MINAS_GERAIS
    -   PARA
    -   PARANA
    -   PERNAMBUCO
    -   SANTA_CATARINA

-   New `Type` enum values:
    -   CONSULAR_VOTER_ID
    -   TWIC_CARD

### Added support for 8 new documents

-   Bolivia - Paper Passport
-   Brazil - Alien ID
-   Brazil - Distrito Federal - Identity Card
-   Brazil - Minas Gerais - Identity Card
-   Cameroon - Polycarbonate Passport
-   Costa Rica - Paper Passport
-   UK - Proof of Age Card
-   USA - Twic Card

### Added support for 17 new documents in BETA

-   Australia - Australian Capital Territory - Identity Card
-   Australia - Queensland - Proof of Age Card
-   Australia - Tasmania - Identity Card
-   Australia - Western Australia - Identity Card
-   Bahrain - Driver’s License
-   Bahrain - Paper Passport
-   Brazil - Maranhao - Identity Card
-   Brazil - Mato Grosso - Identity Card
-   Brazil - Para - Identity Card
-   Brazil - Parana - Identity Card
-   Brazil - Pernambuco - Identity Card
-   Brazil - Santa Catarina - Identity Card
-   Cameroon - Paper Passport
-   Mexico - Quintana Roo, Benito Juarez - Driver’s License
-   Mexico - Quintana Roo -Driver’s License
-   Switzerland - Polycarbonate Passport
-   UAE - Polycarbonate Passport

### Added support for 14 new versions of already supported documents

-   Brazil - Driver’s License
-   Luxembourg - Identity Card
-   North Macedonia - Identity Card
-   Portugal - Driver’s License
-   Slovakia - Identity Card
-   Switzerland - Identity Card
-   Switzerland - Driver’s License
-   Turkey - Polycarbonate Passport
-   Ukraine - Driver’s License
-   USA - Arizona - Driver’s License
-   USA - Arizona - Identity Card
-   USA - Nebraska - Driver’s License
-   USA - Pennsylvania - Identity Card
-   USA - Virginia - Driver’s License

### Added support for 2 new versions of already supported documents in BETA

-   Iceland - Paper Passport
-   Mexico - Consular ID

## 6.3.2

-   Export missing `DocumentSide`

## 6.3.1

-   Reintroduce missing lightweight build

## 6.3.0

### New features

-   Changes to the `BlinkIdSingleSideRecognizer` and `BlinkIdMultiSideRecognizer`:
    -   add new fields inside `StringResult`:
        -   `arabicLocation` - location coordinates of the arabic text or `undefined` if arabic text is empty
        -   `cyrillicLocation` - location coordinates of the cyrillic text or `undefined` if cyrillic text is empty
        -   `latinLocation` - location coordinates of the latin text or `undefined` if latin text is empty
        -   `arabicSide` - document side of the arabic text or `undefined` if arabic text is empty
        -   `cyrillicSide` - document side of the cyrillic text or `undefined` if cyrillic text is empty
        -   `latinSide` - document side of the latin text or `undefined` if latin text is empty
    -   new results in `Recognizer.Result`:
        -   `faceImageLocation`
        -   `faceImageSide`
-   Add new `Country` enum value - `SCHENGEN_AREA`
-   And new `Type` enum value - `IMMIGRANT_VISA`

### Bugfixes

-   Improved scanning success rate and stability when using `BlinkIdMultiSideRecognizer`

### Minor breaking changes

-   renamed and reordeded elements in the `DetectionStatus` enum

## 6.2.1

-   fixed "payload corrupted" error when using online license key
-   fixed integer overflow in BlinkID class filter implementation

## 6.2.0

### New features

-   new and improved machine learning models for data extraction
-   expanded support for arabic documents
-   added isFilledByDomainKnowledge flag to Date and DateResult
    -   indicates that date is not extracted from image but filled based on our internal document knowledge
-   added new setting additionalAnonymization
    -   enables custom anonymization for any field per country, region and type of document
-   added new items to enums:
    -   Region:
        -   NORTHWEST_TERRITORIES (added item to enum, no document support for NORTHWEST_TERRITORIES yet)
        -   NUNAVUT (added item to enum, no document support for NUNAVUT yet)
        -   PRINCE_EDWARD_ISLAND
    -   Type:
        -   ASYLUM_REQUEST
        -   DRIVER_QUALIFICATION_CARD
        -   PROVISIONAL_DL
        -   REFUGEE_PASSPORT
        -   SPECIAL_ID
        -   UNIFORMED_SERVICES_ID
    -   FieldType:
        -   BloodType
        -   Sponsor

### Added support for 9 new documents

-   Belarus - ID Card
-   Guyana - ID Card
-   Jamaica - Paper Passport
-   Myanmar - Paper Passport
-   Palestine - Paper Passport
-   Saint Kitts and Nevis - Driving License
-   Syria - ID Card
-   Trinidad and Tobago - Paper Passport
-   USA - Uniformed Services ID Card

### Added support for 23 new documents in BETA

-   Barbados - Driving License
-   Belarus - Polycarbonate Passport
-   Belarus - Residence Permit
-   Belgium - Provisional Driving License
-   Belgium - Special ID Card
-   Bulgaria - Alien ID Card
-   Bulgaria - Residence Permit
-   Canada - New Brunswick - ID Card
-   Canada - Prince Edward Island - Driving License
-   Estonia - Polycarbonate Passport
-   Germany - Driver Qualification Card
-   Guyana - Driving License
-   Kuwait - Paper Passport
-   Lebanon - Paper Passport
-   Liechtenstein - Driving License
-   Malta - Paper Passport
-   Malta - Polycarbonate Passport
-   Moldova - Driving License
-   Netherlands - Alien ID Card
-   Oman - Paper Passport
-   Peru - Alien ID Card
-   Romania - Residence Permit
-   UK - Asylum Request

### Added support for 28 new versions of already supported documents

-   Canada - British Columbia - Public Services Card
-   Canada - British Columbia - Driving License
-   Cyprus - Residence Permit
-   Denmark - Polycarbonate Passport
-   Germany - ID Card
-   Italy - ID Card
-   Ireland - Passport Card
-   Malta - ID Card
-   Montenegro - ID Card
-   Montenegro - Polycarbonate Passport
-   North Macedonia - ID Card
-   North Macedonia - Polycarbonate Passport
-   Norway - Driving License
-   Norway - Residence Permit
-   Norway - Polycarbonate Passport
-   Philippines - Driving License
-   Sweden - Polycarbonate Refugee Passport
-   Sweden - Social Security Card
-   UAE - Resident ID Card
-   UK - Proof of Age Card
-   USA - Arkansas - ID Card
-   USA - Colorado - ID Card
-   USA - Idaho - ID Card
-   USA - Illinois - ID Card
-   USA - New York - Driving License
-   USA - New York - ID card
-   USA - Pennsylvania - Driving License
-   USA - Washington - Driving License

### Added support for 3 new versions of already supported documents in BETA

-   Denmark - Residence Permit
-   Estonia - Residence Permit
-   Latvia - Residence Permit

### Bugfixes

-   We've fixed the issue with reading the information on the back side of USA/Washington and USA/Vermont driver's license documents.

### Platform-related SDK changes

-   We've fixed a bug within our UI component when using RTL direction on Safari and Firefox browsers.

## 6.1.0

### New features

-   New and improved machine learning models for data extraction
-   Further improved barcode scanning (parsing for non-standard US DLs)
-   Added anonymization for QR code on Dutch ID card
-   Anonymization of religion field on Malaysian documents
-   Device-to-device (D2D) feature - BETA (see more in UI improvements section below)

### Added support for 9 new documents:

-   Australia - Victoria - Proof of Age Card
-   Brazil - Rio de Janeiro - ID Card
-   Liechtenstein - ID Card
-   Luxembourg - Passport
-   Mozambique - ID Card
-   Norway - ID Card
-   Togo - ID Card
-   USA - Wyoming - ID Card
-   Zimbabwe - ID Card

### Added support for 9 new documents in BETA:

-   Barbados - ID Card
-   Belgium - Passport
-   Brazil - Rio Grande do Sul - ID Card
-   Ireland - Residence Permit
-   Japan - Residence Permit
-   Lithuania - Residence Permit
-   Saint Lucia - ID Card
-   USA - New Hampshire - ID Card
-   USA - South Dakota - ID Card

### Added support for 34 new versions of already supported documents:

-   Belgium - Resident ID Card
-   Canada - Residence Permit
-   Estonia - ID Card
-   Finland - Alien ID Card
-   Finland - ID Card
-   Latvia - Alien ID Card
-   Lithuania - ID Card
-   Luxembourg - ID Card
-   Malta - Residence Permit
-   Netherlands - ID Card
-   Netherlands - Residence Permit
-   Poland - ID Card
-   Sweden Residence Permit
-   USA - Alabama - ID Card
-   USA - Alaska - ID Card
-   USA - Colorado - Driving License
-   USA - Connecticut - ID Card
-   USA - District of Colombia - Driving License
-   USA - District of Colombia - ID Card
-   USA - Iowa - ID Card
-   USA - Kansas - ID Card
-   USA - Louisiana - Driving License
-   USA - Maine - Driving License
-   USA - Maine - ID Card
-   USA - Minnesota - ID Card
-   USA - Mississippi - ID Card
-   USA - Nevada - Driving License
-   USA - New York - Driving License
-   USA - South Carolina - ID Card
-   USA - South Dakota - Driving License
-   USA - Texas - ID Card
-   USA - Vermont - Driving License
-   USA - Washington - ID Card
-   USA - Wisconsin - Driving License

### Added support for 2 new versions of already supported documents in BETA:

-   Poland - Residence Permit
-   Portugal - Residence Permit

### Changes to BlinkID VideoRecognizer

`VideoRecognizer` has been refactored.

-   This refactor has fixed some memory leak issues present in the previous implementation.
-   Now uses `requestVideoFrameCallback` for queuing video frames in browsers which support it.
-   Errors are no longer treated as rejected promises, but are instead thrown.
-   `this.videoElement` can no longer be changed or removed on the instance.
-   Implemented iOS browser security rules for video playback.
-   Added a helper `this.getVideoElement` method for getting the reference to the video.

**Breaking changes:**

-   `NotSupportedReason` has been removed and `videoRecognizerErrors` are used directly instead.
-   `onScanningDone` will no longer trigger on user cancellation.
-   `setClearTimeoutCallback` has been removed from the `RecognizerRunner` as it's effectively the same thing as `onFirstSideDone` — it triggers once any recognizer has anything recognized for multi-side recognizers, which is the same as `RecognizerResultState.StageValid`.

Environmental changes

-   TypeScript has been upgraded to 5.x .
-   Packages are now built without regenerator runtime. TSconfig compile target is now `ES2020`.

### UI improvements

#### Device-to-device (D2D) feature - BETA

-   The idea behind the device-to-device (D2D) feature is to provide extraction functionality when the initial device has technical limitations like no camera or no support for WebAssembly. Also, it can be used to direct users to use mobile instead of web cameras for a better scanning experience. Being optimized for conference calls, web cameras often struggle with a focus which causes the image of a document to have a high level of blur thus making it hard to read.

-   D2D can achieve these goals without the need to restart the existing process, such as form filling. When D2D is used, the scanning process is moved from a problematic device to another auxiliary device that has the necessary requirements or better camera quality. There, the scanning will take place, and the extracted results will be sent directly between the initial and auxiliary device browsers without sending images or result data to a Microblink server.

-   Please check out our [D2D documentation](https://github.com/BlinkID/blinkid-in-browser/tree/master/ui#d2d) to learn more about this fantastic feature.

#### BlinkID MultiSide image upload

-   The UI component now supports image upload on both front and back sides, meaning that through our UI component, it is now possible to use the MultiSide recognizer as well.

#### New user instructions, help screens, that lead to successful scans

-   Detailed instructions on how to scan identity documents, via an intro tutorial (onboarding) or floating-action-button (FAB) during scanning, leading to improved success rates in ID scanning and data extraction.
    -   New [properties](https://github.com/BlinkID/blinkid-in-browser/blob/master/ui/docs/components/blinkid-in-browser/readme.md#properties) introduced: `allowHelpScreensFab`, `allowHelpScreensOnboarding`, `allowHelpScreensOnboardingPerpetuity` and `helpScreensTooltipPauseTimeout`.

#### Camera selection toolbar

-   We've introduced the default option of camera selection through a dropdown menu of all available device cameras.
    -   If only one camera is available, the camera selection dropdown will not be displayed.
-   We've introduced icon/button for the option of mirroring the camera video feed.
-   Camera device names are now reported as `"[Front/Back] facing camera [n]"` on Android devices.

#### General

-   We've improved the responsiveness of our user interface accross different browsers for users on mobile devices.

### Other platform-related SDK changes

-   We've improved error exposure to console.
-   We've fixed minor internal reporting logic issue.

## 6.0.1

### Platform-related SDK changes

-   The SDK can now be used with the `wasm-unsafe-eval` content security policy.

### Bugfixes

-   We've fixed a regression in the recognizer runner that could cause subsequent scans to fail.

## 6.0.0

### New features:

#### Extracting ID data from Arabic and Cyrillic IDs

-   When we say you can scan IDs across the globe, we really mean it. Our [list of supported](https://microblink.com/full-list-of-supported-identity-documents/) documents got richer now that we can scan IDs including Arabic and Cyrillic scripts. This fantastic new feature also covers multiscript IDs meaning that we extract data written in both Latin and Arabic data fields.

#### Better barcode scanning and data extraction

-   We’ve improved scanning accuracy for all IDs that hold a PDF417 or other barcode types. This means that the error rate is now 20% lower, which brings even cleaner and more reliable data with every scan of an identity document.

### What's new in the BlinkId(Combined) Recognizer?

-   Renamed `BlinkIdRecognizer` to **BlinkIdSingleSideRecognizer**
-   Renamed `BlinkIdCombinedRecognizer` to **BlinkIdMultiSideRecognizer**
-   We introduced new classes: `StringResult`, `DateResult`, and `Date` in order to support multiple alphabets. If a recognizer supports multiple alphabets, its result class (e.g., `BlinkIdMultiSideRecognizer.Result`) will return `StringResult` for results that previously returned `String`.
-   Added new result property of an `AdditionalProcessingInfo` type that provides information about `missingMandatoryFields`, `invalidCharacterFields`, and `extraPresentFields`
-   Unified `DataMatchResult` and `DataMatchDetailedInfo` into a single structure `DataMatchResult` (removed `dataMatchDetailedInfo` result member)
-   Added new result member `cardOrientation` to `ImageAnalysisResult` structure
-   More info about transitioning to **BlinkID v6.0.0** can be found in [Transition Guide](docs/Transition%20Guide.md)

### Added support for 50 new versions of already supported documents:

-   Mexico - Aguascalientes - Driving license
-   Mexico - Baja California - Driving license
-   Mexico - Hidalgo - Driving license
-   USA - Delaware - Driving license
-   USA - Florida - ID card
-   USA - Hawaii - Driving license
-   USA - Kentucky - ID card
-   USA - Maryland - ID card
-   USA - Michigan - ID card
-   USA - Mississippi - Driving license
-   USA - Mississippi - ID card
-   USA - Missouri - ID card
-   USA - Ohio - ID card
-   USA - Oklahoma - ID card
-   USA - Rhode Island - Driving license

### These documents are no longer BETA:

-   Australia - New South Wales - ID card
-   Australia - South Australia - Proof of Age Card
-   Belgium - Minors ID card
-   Belgium - Passport
-   Canada - Tribal ID card
-   Canada - Weapon Permit
-   Canada - British Columbia - Minors Public Services Card
-   Ireland - Public Services Card
-   Israel - ID card
-   Ivory Coast - Driving License
-   Lebanon - ID card
-   Libya - Polycarbonate Passport
-   Mexico - Colima - Driving license
-   Mexico - Michoacan - Driving license
-   Mexico - Tamaulipas - Driving license
-   Mexico - Zacatecas - Driving license
-   Myanmar - Driving license
-   Panama - Temporary Residence Permit
-   Slovenia - Residence Permit
-   Trinidad and Tobago - Driving license
-   USA - Passport
-   USA - Maine - ID card

### Added support for 2 new ID types in BETA:

#### Latin America and the Caribbean

-   Cuba - ID card
-   Cayman Islands - Drivers License

### Already supported documents but now with option to enable extraction for new scripts

#### Arabic - 5 ID types

-   Egypt - ID card
-   Jordan - ID card
-   UAE - ID card
-   UAE - Passport
-   UAE - Resident ID

#### Cyrillic - 10 ID types

-   Bosnia and Herzegovina - ID card
-   Bulgaria - Drivers License
-   Bulgaria - ID card
-   North Macedonia - Drivers License
-   North Macedonia - ID card
-   Serbia - ID card
-   Ukraine - Drivers License
-   Ukraine - ID card
-   Ukraine - Residence Permit
-   Ukraine - Temporary Residence Permit

### Bugfixes

-   We've fixed a problem with camera focus on iPhone devices that use iOS 16 or newer, most notably iPhone 14.

## 5.20.1

-   We've fixed a target endpoint for internal reporting logic.

## 5.20.0

### New feature:

-   ML models with new architecture that result in further 8% decrease in error rate

### Support for 8 new document types:

#### Northern America

-   USA - Polycarbonate Passport
-   USA - Nebraska - ID Card
-   USA - New York - ID Card
-   USA - Utah - ID Card

#### Latin America and the Caribbean

-   Mexico - Polycarbonate Passport
-   Brazil - Sao Paolo - ID Card

#### Europe

-   Austria - Residence Permit

#### Asia

-   Philippines - ID Card

### Back side support added:

-   Australia - South Australia - Driving license

### Added support for 29 new versions of already supported documents:

-   Australia - Northern Territory - Proof of Age Card
-   Belgium - Minors ID Card
-   Belgium - Residence Permit
-   Bolivia - ID Card
-   Croatia - Residence Permit
-   Cyprus - ID Card
-   Czechia - ID card
-   Czechia - Residence Permit
-   Dominican Republic - Paper Passport
-   Greece - Residence Permit
-   Italy - Residence Permit
-   Ivory Coast - Driving license
-   Kuwait - Driving license
-   Mexico - Jalisco - Driving license
-   Mexico - Nuevo Leon - Driving license
-   Peru - ID Card
-   Poland - Driving license
-   Slovenia - ID Card
-   Sweden - ID Card
-   Sweden - Polycarbonate Passport
-   USA - Georgia - ID Card
-   USA - Iowa - ID Card
-   USA - Kansas - Driving license
-   USA - Maryland - ID Card
-   USA - Nebraska - ID Card
-   USA - New York - Driving license
-   USA - New York - ID Card
-   USA - Oklahoma - Driving license
-   Vietnam - ID Card

### These documents are no longer BETA:

-   Finland - Residence Permit
-   Guatemala - Driving license

### Added support for 2 new ID types in BETA:

-   Antigua and Barbuda - Driving license
-   Mexico - Professional ID Card

### Changes to BlinkID(Combined) Recognizer

-   ClassInfo:

    -   Added to JSON serialization:
        -   isoNumericCountryCode
        -   isoAlpha2CountryCode
        -   isoAlpha3CountryCode

-   BarcodeData:

    -   JSON serialization update: stringData member is now in base64 format

-   Added new item to enums:

    -   Region:
        -   Sao Paulo, when scanning Brazilian Driving licenses

-   Fixed scanning for Argentina ID - there were confusions for Veteran ID, now we enabled successful extraction on Veteran ID as well

### Environment changes

-   We've updated environment to Node v16.3.0.

## 5.19.2

-   We've fixed a target endpoint for internal reporting logic.

## 5.19.1

-   We've fixed a major problem with internal reporting logic.

## 5.19.0

What's new in the BlinkID(Combined) Recognizer?

### Support for atypical Vietnam passports

-   Extract data from Vietnam Passports that have non-ICAO compliant MRZ fields. For example, when the filler arrow is facing the other way (>) instead of the standard way (<)
    ​

### Data anonymization

-   We've added the option to not extract the religion field on all supported Malaysian documents (MyKad, MyKas, MyKid, MyPR, MyTentera)
    ​

### Bugfixes

-   Resolved issues with RGB color overlay when extracting document image, which was present on some devices
-   We've fixed a bug with CSS `::part()` pseudo-selector to enable safe CSS customization of nested elements like `mb-camera-toolbar`.

### Optimizing camera usage

-   We are now preventing aborting the scanning process when using the UI component until the camera is not being fully initialized due to potential issues with reusing the camera's resources.

## 5.18.0

### New feature:

-   Updated machine learning models resulting in a 41% reduced error rate.

### Support for 16 new document types:

#### Northern America

-   USA - Passport Card
-   Usa - District of Columbia - ID Card
-   USA - Iowa - ID Card
-   USA - Tennessee - ID Card

#### Latin America and the Caribbean

-   Cuba - Paper Passport
-   Dominican Republic - Paper Passport
-   Panama - Residence Permit (front onyl)
-   Peru - Paper Passport

#### Europe

-   Cyprus - Paper Passport
-   Germany - Minors Passport
-   UK - Proof of Age Card (front onyl)
-   Ukraine - Residence Permit
-   Ukraine - Temporrary Residence Permit

#### Middle East and Africa

-   Qatar - Paper Passport
-   UAE - Paper Passport

#### Oceania

-   Australia - Northern Territory - Proof of Age Card

### Back side support added:

-   Austria - ID Card
-   Australia - South Australia - Driving license
-   Australia - Tasmania - Driving license
-   Canada - Quebec - Driving license
-   Mexico - Quintana Roo Solidaridad - Driving license
-   USA - Washington - Driving license

### Added support for 26 new versions of already supported documents:

-   Afghanistan - ID Card
-   Bahrain - ID Card
-   Hungary - Residence Permit
-   India - ID Card
-   Mexico - Tabasco - Driving license
-   New Zealand - Driving license (front only)
-   The Philippines - Professional ID (front only)
-   Slovakia - Residence Permit
-   South Africa - ID Card
-   Switzerland - Residence Permit
-   UK - Driving license
-   USA - Colorado - Driving license
-   USA - Idaho - Driving license
-   USA - Kansas - ID Card
-   USA - Kentucky - Driving license
-   USA - Maine - Driving license
-   USA - Massachusetts - ID Card
-   USA - Nebraska - Driving license
-   USA - New Hampshire - Driving license
-   USA - New Jersey - ID Card
-   USA - New Mexico - ID Card
-   USA - North Carolina - ID Card
-   USA - Utah - Driving license
-   USA - Vermont Driving license
-   USA - West Virginia - Driving license

### These documents are no longer BETA:

-   Algeria - Paper Passport
-   Slovakia - Residence Permit
-   USA - Mississippi - ID Card

### Added support for 8 new ID types in BETA:

-   Iceland - Paper Passport
-   South Africa - ID Card (front only)
-   Brazil - Consular Passport (beta)
-   Quintana Roo Cozumel - Driving license
-   Canada - Social Security Card (front only)
-   Canada - British Columbia - Minor Public Services Card
-   USA - Maine - ID Card
-   USA - North Dakota - ID Card

### Changes to BlinkID(Combined) Recognizer

-   Added new enums:
    -   Region: `QUINTANA_ROO_COZUMEL`
    -   Type: `CONSULAR_PASSPORT`, `MINORS_PASSPORT`, and `MINORS_PUBLIC_SERVICES_CARD`

### Platform-related SDK changes

-   We've added a support for two different WebAssembly build versions.
    -   Standard and default build that has all the optimisations, but has considerably larger file size compared to lightweight version.
    -   Lighter version of the WebAssembly bundle that doesn’t have all optimizations for reading of dense barcodes with low quality cameras.

## 5.17.1

-   We've fixed a problem that has caused the enormous size of WebAssembly bundles.

## 5.17.0

### Changes to BlinkID(Combined) Recognizer

-   We've introduced the expanded DataMatch functionality for the BlinkID with the new result member called `dataMatchDetailedInfo`
    -   This result member will enable you to see for which field has been performed, or it did not, the DataMatch functionality. This is enabled for `dateOfBirth`, `documentNumber` and `dateOfExpiry`.
    -   For example, if the date of expiry is scanned from the front and back side of the document and values do not match, this method will return `DataMatchResult: Failed`.
        -   Result will be `DataMatchResult: Success` only if scanned values for all fields that are compared are the same. If data matching has not been performed, the result will be `DataMatchResult: NotPerformed`. This information is available for every of the three mentioned field values above.
-   We've fixed issues with scanning Argentina AlienID, where there were confusions with the regular ID. `ClassInfo` now correctly returns which ID type is present based on the barcode data.

### Platform-related SDK changes

-   **[BREAKING CHANGE]** Due to security reasons, we've added a mechanism to load worker script from an external location.
    -   New property `WasmSDKLoadSettings.workerLocation` was added for this purpose and represents a path to the external worker script file.
    -   If omitted, SDK will look for the worker script in the `resources` directory.

### UI Improvements

-   We've added property `recognitionPauseTimeout` to the UI component that defines scanning pause after the first side of a document has been scanned.
    -   The purpose of this property is to give the end-user enough time to flip the document before scanning is resumed.
    -   Default value is `3800` and represents time in milliseconds.
-   We've exposed property `cameraExperienceStateDurations` on the UI component that can be used to change the default durations of UI animations.

## 5.16.0

We've added new documents to our list of supported documents:

#### Europe

-   Austria - ID Card (front only)
-   Germany - ID Card

#### Latin America and the Caribbean

-   Brazil - ID Card (beta)
-   Colombia - ID Card (front only)
-   Ecuador - ID Card

#### Mexico

-   Baja California Sur - Driving Licence (beta)
-   Ciudad De Mexico - Driving Licence (front only)
-   Colima - Driving Licence (front only, beta)
-   Michoacan - Driving Licence (beta)
-   Nayarit - Driving Licence (beta)
-   Quintana Roo Solidaridad - Driving Licence (front only)
-   Tlaxcala - Driving Licence
-   Veracruz - Driving Licence (beta)

#### Oceania

-   Australia - Northern Territory (beta)

#### Asia

-   Japan - My Number Card (front only)
-   Singapore - Resident ID

#### Northern America

-   USA - Missouri - ID Card
-   USA - Nevada - Driving Licence
-   USA - New York City - ID Card
-   USA - Oklahoma - ID Card

#### Back side support added:

-   Mexico - Chiapas - Driving License

#### No longer BETA:

-   Mexico - Baja California - Driving Licence
-   Mexico - Chihuahua - Driving Licence
-   Mexico - Coahuila - Driving Licence
-   Mexico - Guanajuato - Driving Licence
-   Mexico - Mexico - Driving Licence

### Changes to BlinkID(Combined) Recognizer

-   Added the setting `saveCameraFrames` for saving camera frames with the default value being `false`.
    -   New result members are also available here: `frontCameraFrame`, `backCameraFrame`, `barcodeCameraFrame`.
    -   Memory consumption significantly increases if set to `true`.
-   We've added new result members when scanning Australian Driving Licences: `vehicleClass`, `licenceType`, `effectiveDate` and `expiryDate`.
    -   Result member are displayed under the `VehicleClassInfo` field; we can also extract data from multiple rows when this vehicle class info data is present on the document (e.g. multiple expiry dates for different vehicle classes).
-   We've added new enum values:
    -   Region: `QUINTANA_ROO`, `QUINTANA_ROO_SOLIDARIDAD`, `TLAXCALA` which are available when scanning Mexican Driving Licences.
    -   Type: `MY_NUMBER_CARD` which is available when scanning Japanese My Number Card documents.
-   We've added new result member `additionalOptionalAddressInformation` which gives additional address information about the document owner.
    -   This result member can be present when scanning the Pakistani ID Card for the field `Country of Stay`.

#### Changes to IDBarcodeRecognizer

-   For barcodes in countries: Argentina, Colombia, Nigeria, Panama, and South Africa, we now also extract data from the field `Sex` when it's populated with the character "X".

### Improvements

-   We've added support for Brazil ID Card when the cardholder's face image is rotated for 90 degrees on the document.
    -   We will return face image and document image + data from VIZ part present on the back side.
-   BlinkIdCombinedRecognizer can return the full frame from the front side if `saveCameraFrames` is set to `true`, whereas before it returned the full frame only for the back side.

## 5.15.2

-   We removed `digitalSignature` property and related recognizer options

## 5.15.1

-   We've updated Microblink logo and colors

## 5.15.0

We support the latest versions of these documents:

### Europe

-   Belgium - Driving License (front only)
-   Croatia - ID Card
-   France - ID Card
-   France - Residence Permit (beta)
-   Spain - ID Card
-   Switzerland - Residence Permit
-   UK - Residence Permit

### Oceania

-   Australia - Northern Territory - Driving License (front only, beta)

### Middle East and Africa

-   UAE - ID Card
-   UAE - Resident ID

### Northern America

-   Honduras - ID Card (beta)
-   USA - Colorado - ID Card
-   USA - Minnesota - Driving License
-   USA - Nevada - Driving License
-   USA - Oklahoma - Driving License
-   USA - Wyoming - Driving License

### Changes to BlinkID(Combined) Recognizer

-   No API changes

### Improvements

-   We now support `DataMatch` functionality on single side documents (Passports)
    -   We added a special case to support `DataMatch` for UAE ID Card and Resident ID Card documents for the field `personal_id_number`
-   We can now extract `additional_personal_id_number` on Ecuador ID Card
-   We've made improvements for reading NRIC number on Malaysian documents that have an asterisk (\*) character present
-   We've improved document detection and cropping of the document image

### Changes to IDBarcodeRecognizer

-   We've added document type `ArgentinaAlienID` and parser for `ArgentinaAlienID2012BarcodeParser`

### Platform-related SDK changes

-   We've added methods for programmatically starting camera and image scan when using the UI component.
    -   It's possible to call `startCameraScan()` and `startImageScan(File)` methods on the custom web element.
-   We've standardized error structures returned from the WebAssembly library and the UI component.
    -   See [SDKError.ts](src/MicroblinkSDK/SDKError.ts) and [ErrorTypes.ts](src/MicroblinkSDK/ErrorTypes.ts) for a complete list of possible error codes.
-   We've completed support for `part::` selector and added [an example](ui/README.md#customization-ui-css-part).
-   We've simplified integration of the UI component with Angular and React frameworks.
    -   [Integration guide for Angular](ui/README.md#installation-angular)
    -   [Integration guide for React](ui/README.md#installation-react)

### Bug fixes

-   We've ensured that all SDK errors can be visible from `fatalError` and `scanError` events in the UI component.

## 5.14.2

-   We've expanded support for `part::` selector by exposing all nested web components.
-   We've fixed styles regarding width and height for camera scanning UI to provide more flexibility to developers.

## 5.14.1

-   We've added support for `part::` selector to provide more flexibility when customizing built-in UI. [#35](https://github.com/BlinkID/blinkid-in-browser/issues/35)

### UI bug fixes

-   We've fixed a bug where a user couldn't upload an image after the camera scan failed to start.
-   We've fixed a bug where the video feed wasn't released in the scenario where the UI component was removed from the DOM.
-   We've reverted style changes regarding width and height for camera scanning UI to provide more flexibility to developers.
-   We've improved memory management during the initialization of the UI component to avoid the creation of unnecessary web workers.

## 5.14.0

### Back side support added:

-   Thailand - ID Card

### Improvements

-   Extraction of father’s and mother’s names from Mexico Voter ID Card
-   The driver license unique card number is extracted as `document_additional_number` for Australian Driving Licenses, regions New South Wales, Northern Territory, Queensland, Victoria and Western Australia
-   We've improved the accuracy of barcode scanning on identity documents

### Changes to BlinkID(Combined) Recognizer

-   We've added two new result fields - `fathersName` and `mothersName` both in BlinkID and BlinkIDCombined Recognizers, as well as in VIZ result

### Changes to BarcodeRecognizer

-   We’ve removed support for `aztec` and `dataMatrix` barcode formats

### Changes to MRTDRecognizer

-   We've added `MRTD_TYPE_BORDER_CROSSING_CARD` type to MRTD enum

### Platform-related SDK changes

-   We've added a camera management UI module for the selection of connected cameras
    -   We've added `VideoRecognizer.changeCameraDevice` method that can be used to change the active camera device during the scanning session
-   We've improved accessibility of the UI component by changing background contrasts and increasing default font sizes

### Bug fixes

-   We've optimised memory usage of the SDK by fixing a problem where every refresh of the UI component would result in a new instance of web worker

## 5.13.0

### New additions to our supported document list

We’ve added 61 new documents:

#### Europe

-   Austria - Paper Passport
-   Belarus - Paper Passport
-   Belgium - Paper Passport (beta)
-   Bulgaria - Paper Passport
-   Estonia - Paper Passport
-   France - Paper Passport (beta)
-   Georgia - Paper Passport (beta)
-   Germany - Paper Passport
-   Greece - Paper Passport
-   Hungary- Paper Passport
-   Italy - Paper Passport (beta)
-   Kosovo - Paper Passport
-   Moldova - Paper Passport (beta)
-   Poland - Paper Passport
-   Portugal - Paper Passport
-   Spain - Paper Passport
-   Switzerland - Paper Passport
-   UK - Paper Passport

#### Middle East and Africa

-   Algeria - Paper Passport (beta)
-   Egypt - Paper Passport (beta)
-   Eswatini - Paper Passport
-   Ghana - Paper Passport
-   Iran - Paper Passport (beta)
-   Iraq - Paper Passport (beta)
-   Israel - Paper Passport (beta)
-   Jordan - Paper Passport (beta)
-   Kenya - Polycarbonate Passport
-   Libya - Polycarbonate Passport (beta)
-   Morocco - Paper Passport (beta)
-   Nigeria - Paper Passport
-   Nigeria - Polycarbonate Passport (beta)
-   Qatar - ID Card (front only, beta)
-   Saudi Arabia - Paper Passport
-   Syria - Paper Passport
-   Tanzania - ID Card (beta)
-   Tanzania - Voter ID (front only, beta)
-   Tunisia - Paper Passport
-   Turkey - Paper Passport
-   Zimbabwe - Paper Passport

#### Latin America and the Caribbean

-   Argentina - Paper Passport
-   Brazil - Paper Passport (beta)
-   Guatemala - Paper Passport
-   Haiti - Paper Passport
-   Honduras - Paper Passport (beta)
-   Mexico - Paper Passport (beta)
-   Mexico - Nayarit - Driving Licence (beta)

#### Asia

-   Bangladesh - Paper Passport
-   China - Paper Passport (beta)
-   India - Paper Passport
-   Indonesia - Paper Passport
-   Japan - Paper Passport
-   Nepal - Paper Passport
-   Pakistan - Paper Passport
-   Philippines - Paper Passport
-   South Korea - Paper Passport (beta)
-   Sri Lanka - Paper Passport
-   Uzbekistan - Paper Passport

#### Oceania

-   Australia - Paper Passport

#### Northern America

-   Canada - Paper Passport
-   Canada - Weapon Permit (front only, beta)
-   USA - Paper Passport (beta)

#### Back side support added:

-   Greece - ID Card
-   Burkina Faso - ID Card
-   Democratic Republic of the Congo - Driving Licence
-   Mexico - Veracruz - Driving Licence
-   Canada - Citizenship Certificate

#### No longer BETA:

-   Belarus - Driving Licence
-   UK - Polycarbonate Passport
-   Argentina - Alien ID
-   Bahamas - Driving Licence
-   Mexico - Durango - Driving Licence
-   Venezuela - ID Card
-   USA - Kansas - ID Card

### Changes to BlinkID(Combined) Recognizer

-   We’ve renamed the Swaziland country to Eswatini in results and `ClassInfo` structure
-   Improved result validation
    -   `FieldIdentificationFailed` processing status is used to indicate if unexpected fields are present on the document. Those fields are then deleted from the result
-   We are filling out COUNTRY and REGION fields in ClassInfo, without the field TYPE of document, when using BarcodeID mode for scanning documents where the Front side is not supported, and back side results are extracted from AAMVA compliant barcodes
    -   This applies only if `ClassInfo` isn’t already prepopulated in some other way and when you’re not in `FullRecognition` mode

### Improvements

-   We can now extract the date of birth from the document number on the South Korean identity card and from the personal identification number on the driving licence

### Anonymization

-   We’ve added anonymization support for new documents:
    -   Document number on Germany paper bio-data page Passport
    -   Document number on South Korea Identity Card
    -   Personal identification number on South Korea driving licence
    -   Personal identification number on South Korea paper bio-data page Passport

### Platform-related SDK changes

-   We've improved the performance of the SDK by adding support for WebAssembly SIMD.
    -   This increases the scanning performance on compatible browsers up to 77% and up to 94% in cases when WebAssembly threads are also supported.
    -   Keep in mind that this feature requires a compatible browser (Chrome 91 and Firefox 90 or newer versions). Only `advanced` and `advanced-threads` binaries are using SIMD. In case that the browser doesn't support this feature, `basic` binary will be used.
-   We've reduced the memory fragmentation during video processing, resulting in a smaller memory footprint.

## 5.12.0

### New additions to our supported documents list

We've added 15 new documents:

#### Europe

-   North Macedonia - Polycarbonate Passport

#### Middle East and Africa

-   Botswana - ID Card
-   Sudan - Polycarbonate Passport

#### Latin America & the Caribbean

-   Mexico - Baja California Sur - Driving Licence (beta)
-   Mexico - Campeche - Driving Licence (beta)
-   Mexico - Colima - Driving Licence (beta)

#### Oceania

-   Australia - Health Insurance Card (front only, beta)

#### Asia

-   Azerbaijan - Polycarbonate Passport (beta)
-   Tajikistan - Polycarbonate Passport (beta)

#### Northern America

-   Canada - Citizenship Certificate (front only, beta)
-   Canada - Ontario - Health Insurance Card (front only)
-   Canada - Quebec - Health Insurance Card (front only, beta)
-   USA - Military ID Card
-   USA - Rhode Island - ID Card
-   USA - South Carolina - ID Card

#### Back side support added:

-   Ireland - Passport Card
-   Mexico - Puebla - Driving Licence
-   Singapore - S PASS

#### No longer BETA:

-   Finland - Polycarbonate Passport
-   Ireland - Passport Card
-   Ireland - Polycarbonate Passport
-   Kosovo - Driving Licence
-   Latvia - Polycarbonate Alien Passport
-   Latvia - Polycarbonate Passport
-   Poland - Polycarbonate Passport
-   Cameroon - ID Card
-   Ghana - ID Card
-   Iraq - ID Card
-   Tanzania - Driving Licence
-   Turkey - Polycarbonate Passport
-   Uganda - Driving Licence
-   Bolivia - Minors ID
-   Chile - Driving Licence
-   Ecuador - Driving Licence
-   Haiti - Driving Licence
-   India - Karnataka - Driving Licence
-   India - Maharashtra - Driving Licence
-   Pakistan - Punjab - Driving Licence
-   USA - Global Entry Card
-   USA - New Mexico - ID Card
-   USA - Wisconsin - ID Card

### Changes to BlinkID(Combined) Recognizer

-   We've added the parameter `maxAllowedMismatchesPerField` to settings. When this is set to a non-zero value, DataMatch will pass as long as the number of mismatched characters doesn't exceed the specified value.
-   We've enabled the return of image and back-side data results, even when the `State` is `Uncertain`. Keep in mind that returned images, in this case, might be blurry or low quality.
    -   This applies to all images: face image, full document image, and signature image.

### Improvements

-   We can now extract information from NRIC numbers on Malaysian documents that have the asterisk (\*) character in it.
-   While using `FullRecognitionMode` for scanning unsupported Passports, we are now taking `ClassInfo` from MRZ
-   We are now correctly handling fully cropped vertical images
-   Fix for correct parsing of Bermuda Driving Licence AAMVA-compliant barcode dates
-   Fix for correct calculation of check digit for Saudi Arabia ID Card MRZ

#### Postprocess improvement

-   We are splitting names and descriptors into two different results (e.g., Nom d’ usage, Epouse, Geb. etc.), where descriptors are in their separate field `name_additional_info`, for these documents:
    -   France
        -   ID Card
        -   Residence Permit
    -   Germany
        -   ID Card
    -   Luxembourg
        -   ID Card
    -   Netherlands
        -   Driving Licence
        -   Polycarbonate Passport

#### Sanitization of names

-   We are removing title prefixes (e.g., Mrs., Mr., Ing., etc.) from `full_name`, `first_name` and `last_name` for these documents:
    -   Austria
        -   Driving Licence
        -   ID Card
    -   Czechia
        -   Driving Licence
    -   Germany
        -   ID Card
    -   Thailand
        -   ID Card
    -   UK
        -   Driving Licence

#### Anonymization

-   We've added anonymization support for new documents:
    -   Document number on Germany Polycarbonate Passport
    -   Document number on Hong Kong Polycarbonate Passport
    -   Document number, personal ID number on Singapore Polycarbonate Passport

### SDK changes

-   We've added a mechanism to automatically delete an instance of worker script in case of unsuccessful SDK initialization.
    -   New method `WasmSDK.delete()` was added for this purpose and is available on every instance of the SDK.
-   We've changed improper error handling in the `VideoRecognizer` class.
    -   From now on, it's possible to catch all errors that happen during the video recognition.

## 5.11.4

-   Generated missing assets when UI component is used as NPM package

## 5.11.3

-   We’ve fixed a bug that would cause `recognizerOptions` to work incorrectly on still images

## 5.11.2

### SDK changes

-   We've exposed a couple of functions that are used by the SDK to determine which WebAssembly bundle to load and from which location
    -   Function `detectWasmType()` returns the best possible WebAssembly bundle based on the features a browser supports.
    -   Function `wasmFolder( WasmType )` returns the name of the resources subfolder of the provided WebAssembly bundle type.
    -   For more information on how to implement these functions, see [`WasmLoadUtils.ts`](src/MicroblinkSDK/WasmLoadUtils.ts) file.

### UI Improvements

-   You can now set a camera feedback message to the user when BlinkID IDBarcode recognizer is used
    -   Set `showCameraFeedbackBarcodeMessage` property to display a custom message.
    -   Use `translations` property to translate a custom message.
-   Camera rectangle cursor is more responsive now when BlinkID IDBarcode recognizer is used.

### Bugfixes

-   Container width size on UI component for action label (`Scan or choose from gallery`) and action buttons (`Device camera` and `From gallery`) are now responsive on Safari.

## 5.11.1

-   We've fixed a broken `rollup.config.js` which resulted in unusable UMD development bundle

## 5.11.0

### Breaking changes

-   We've changed the way how recognizer options are set up when using the UI component
    -   You can now specify how a recognizer should behave by using the new `recognizerOptions` property.
    -   To see the full list of available recognizer options, as well as examples on how to use them, check out the [relevant source code](ui/src/components/blinkid-in-browser/blinkid-in-browser.tsx).
-   We've removed property and attribute `anonymization` from the UI component since it can now be defined with the new `recognizerOptions` property

### Newly supported identity documents:

We’ve added 98 new documents:

#### Europe

-   Albania - Driver Card (front only)
-   Albania - Professional Driver License (front only)
-   Belarus - Driver License (front only, beta)
-   Belgium - Minors ID (beta)
-   Czechia - Residence Permit
-   Finland - Alien ID
-   Finland - Residence Permit (beta)
-   Georgia - Driver License (front only)
-   Greece - Residence Permit
-   Ireland - Passport Card (beta)
-   Ireland - Public Services Card (beta)
-   Kosovo - Driver License (front only, beta)
-   Latvia - Alien ID
-   Luxembourg - ID Card
-   Moldova - ID Card (beta)
-   North Macedonia - Driver License (front only)
-   North Macedonia - ID Card
-   Poland - Passport (beta)
-   Slovenia - Residence Permit (beta)
-   Spain - Alien ID
-   UK - Passport (beta)

#### Middle East and Africa

-   Algeria - Driver License
-   Burkina Faso - ID Card (front only)
-   Cameroon - ID Card (beta)
-   Democratic Republic Of The Congo - Driver License (front only, beta)
-   Egypt - Driver License (beta)
-   Ghana - ID Card (beta)
-   Iraq - ID Card (beta)
-   Ivory Coast - Driver License (front only, beta)
-   Ivory Coast - ID Card
-   Lebanon - ID Card (beta)
-   Morocco - Driver License
-   Mozambique - Driver License (front only, beta)
-   Oman - Driver License (beta)
-   Rwanda - ID Card (front only)
-   Senegal - ID Card
-   Tanzania - Driver License (front only, beta)
-   Tunisia - Driver License (front only)
-   Uganda - Driver License (front only, beta)

#### Latin America & the Caribbean

-   Argentina - Alien ID (beta)
-   Bahamas - ID Card (front only, beta)
-   Bolivia - Minors ID (beta)
-   Jamaica - Driver License
-   Mexico - Residence Permit (beta)
-   Mexico - Chiapas - Driver License (front only)
-   Mexico - Coahuila - Driver License (beta)
-   Mexico - Durango - Driver License(front only, beta)
-   Mexico - Guerrero-cocula - Driver License (beta)
-   Mexico - Guerrero-juchitan - Driver License (beta)
-   Mexico - Guerrero-tepecoacuilco - Driver License (front only, beta)
-   Mexico - Guerrero-tlacoapa - Driver License (front only, beta)
-   Mexico - Hidalgo - Driver License
-   Mexico - Mexico - Driver License (beta)
-   Mexico - Morelos - Driver License (front only)
-   Mexico - Oaxaca - Driver License
-   Mexico - Puebla - Driver License (front only, beta)
-   Mexico - San Luis Potosi - Driver License (front only)
-   Mexico - Sinaloa - Driver License (front only, beta)
-   Mexico - Sonora - Driver License (beta)
-   Mexico - Tabasco - Driver License (beta)
-   Mexico - Yucatan - Driver License (beta)
-   Mexico - Zacatecas - Driver License (beta)
-   Panama - Temporary Residence Permit (beta)
-   Peru - Minors ID (beta)
-   Trinidad And Tobago - Driver License (front only, beta)
-   Trinidad And Tobago - ID Card

#### Oceania

-   Australia - South Australia - Proof Of Age Card (front only, beta)

#### Asia

-   Armenia - ID Card
-   Bangladesh - Driver License (beta)
-   Cambodia - Driver License (front only, beta)
-   India - Gujarat - Driving Licence (front only, beta)
-   India - Karnataka - Driving Licence (front only, beta)
-   India - Kerala - Driving Licence (beta)
-   India - Madhya Pradesh - Driving Licence (front only, beta)
-   India - Maharashtra - Driving Licence (front only, beta)
-   India - Punjab - Driving Licence (front only, beta)
-   India - Tamil Nadu - Driving Licence (beta)
-   Kyrgyzstan - ID Card
-   Malaysia - Mypolis (beta)
-   Malaysia - Refugee ID (front only)
-   Myanmar - Driver License (beta)
-   Pakistan - Punjab - Driving Licence (front only, beta)
-   Sri Lanka - Driving Licence (front only)
-   Thailand - Alien ID (front only)
-   Thailand - Driver License (beta)
-   Uzbekistan - Driver License (front only, beta)

#### Northern America

-   Canada - Tribal ID (beta)
-   Canada - Nova Scotia - ID Card (beta)
-   Canada - Saskatchewan - ID Card (beta)
-   USA - Border Crossing Card (front only)
-   USA - Global Entry Card (beta)
-   USA - Nexus Card (beta)
-   USA - Veteran ID (front only)
-   USA - Work Permit
-   USA - Mississippi - ID Card (beta)
-   USA - Montana - ID Card
-   USA - New Mexico - ID Card (beta)
-   USA - Wisconsin - ID Card (beta)

#### Back side support added:

-   Hungary - Residence Permit
-   Luxembourg - Residence Permit (no longer beta)
-   Mauritius - ID Card
-   Colombia - Alien ID (no longer beta)
-   Mexico - Baja California - Driver License
-   Mexico - Chihuahua - Driver License
-   Mexico - Guanajuato - Driver License
-   Mexico - Michoacan - Driver License
-   Malaysia - MyKid
-   Malaysia - MyPR

#### No longer beta:

-   Albania - Passport
-   Malta - Residence Permit
-   Switzerland - Residence Permit
-   Bolivia - Driver License
-   Chile - Passport
-   El Salvador - ID Card
-   Peru - ID Card
-   Singapore - S Pass (front only)

### Changes to the BlinkId(Combined)Recognizer

-   You can now retrieve an image of the document owner along with cropped images of the document itself whenever you’re scanning an AAMVA-compliant ID:
    -   Using `BarcodeId` as a `RecognitionMode` lets you scan US driver licenses and IDs that BlinkID can’t read from the Visual Inspection Zone (VIZ) alone. Use it to extract:
        -   A face image from the front side
        -   Barcode data from the back side
        -   Cropped document images of both sides
    -   You can disable this `RecognitionMode` by setting `enableBarcodeId` to `false` in the `RecognitionModeFilter`.
-   We've improved data extraction through the MRZ:
    -   We now allow standard M/F values for gender on Mexican documents (along with localized H/M values)
-   We're now converting dates to the Gregorian calendar for:
    -   Taiwan documents with Republic of China (ROC) calendar dates
    -   Saudi documents with Islamic calendar dates
-   We're now auto-filling all ‘partial’ dates found on identity documents (showing year or month-year only):
    -   Date of issue will be converted to the first day of the (first) month
        -   E.g. '1999' will be converted to '01.01.1999.'
        -   E.g. '03.1999.' will be converted to '01.03.1999.'
    -   Date of expiry will be converted to the last day of the (last) month
        -   E.g. '1999' will be converted to '31.12.1999.'
        -   E.g. '03.1999.' will be converted to '31.03.1999.'

### Changes to the UI component

-   You can now scan identity documents with barcodes, for example US driver’s licenses, with BlinkId(Combined)Recognizer
    -   A user will now receive a feedback message whenever barcode scanning is taking place, with instructions to point the camera closer to the barcode, if needs be.
    -   This change should result in better results when scanning the aforementioned documents.

### Performance improvements

-   We've added three different flavors of WebAssembly builds to the SDK, to provide better performance across all browsers
    -   Unless defined otherwise, the SDK will load the best possible bundle during initialization:
        -   `Basic` Same as the existing WebAssembly build, most compatible, but least performant.
        -   `Advanced` WebAssembly build that provides better performance but requires a browser with advanced features.
        -   `AdvancedWithThreads` Most performant WebAssembly build which requires a proper setup of COOP and COEP headers on the server-side.
    -   For more information about different WebAssembly builds and how to use them properly, check out the [relevant section](README.md/#deploymentGuidelines) in our official documentation

### Bugfixes

-   We fixed the initialization problem that prevented the SDK from loading on iOS 13 and older versions

## 5.10.2

-   Constructor of `VideoRecognizer` class is now public

## 5.10.1

-   It's now possible to define anonymization mode when using UI component
    -   The default value of anonymization mode is `AnonymizationMode.FullResults` which means certain documents are anonymized by default.
    -   To change default value set attribute/property `anonymization` to one of supported values `None`, `ImageOnly`, `ResultFieldsOnly` or `FullResult`.

## 5.10.0

**Newly supported identity documents**

-   Saudi Arabia - DL (front)
-   Saudi Arabia - Resident ID (front)

### Changes to the BlinkId(Combined)Recognizer:

-   We're now able to extract the additional address on Hungary Address Cards
-   We've improved data extraction through the MRZ:
    -   We now return the document type through `ClassInfo`, regardless of the `RecognitionMode` you're using (`MrzId`, `MrzPassport` or `MrzVisa`).
    -   This means you can now use `ClassFilter` to filter these documents by their type.
    -   We now return the document number on Nigeria IDs complete with its check digit.
    -   We now support Italy Residence Permits with a _CR_ document code.
-   We've extended the `ClassInfo` structure with helper methods so you can filter documents by country more easily:
    -   Use `countryName`, `isoNumericCountryCode`, `isoAlpha2CountryCode` and `isoAlpha3CountryCode` to get the full country names or their representative codes, as defined by [ISO](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes).
-   We've extended the `BarcodeResult` structure with `extendedElements`
    -   You can find all data from AAMVA-compliant barcodes under their respective `BarcodeElementKey` in the `BarcodeElements` structure.
    -   For a full list of keys please see [here](src/Recognizers/BlinkID/Generic/BarcodeResult.ts#L91).
-   We've added another `ProcessingStatus` called `AwaitingOtherSide`
    -   This status is triggered once BlinkID has finished with the first side of a document and expects the other side, too.
-   We're now able to extract the date of birth from the CURP field on Mexico Voter IDs
-   We've added a new recognition mode for recognizing still images of documents that have already been cropped:
    -   Set the `scanCroppedDocumentImage` to true when you're feeding BlinkID images of documents that have already been cropped and don't require detection.
    -   Keep in mind that this setting won't work on document images that haven't been properly cropped.

### Changes to the IdBarcodeRecognizer:

-   We've extended the results with `extendedElements`
    -   You can find all data from AAMVA-compliant barcodes under their respective `BarcodeElementKey` in the `BarcodeElements` structure.
    -   For a full list of keys please see [here](src/Recognizers/BlinkID/Generic/BarcodeResult.ts#L91).

### Deprecated recognizers:

-   We've deprecated `UsdlRecognizer`. Please use `IdBarcodeRecognizer` instead

### Changes to the UI component:

-   We’ve added new ways you can configure the UI component to better fit the way your app looks and behaves.
    -   For a full list of attributes, properties and events you can modify, please see the [API documentation](ui/docs/components/blinkid-in-browser/readme.md).
    -   For a full list of CSS variables please see [\_globals.scss file](ui/src/components/shared/styles/_globals.scss).

### Changes to RecognizerRunner class:

-   Invoking `RecognizerRunner.processImage` on multiple still images will no longer implicitly reset the recognizer chain.
    -   This means you can now use BlinkIdCombinedRecognizer to scan both sides of a document by giving it two still images.
    -   If you still need to reset the recognizers, you can do that manually by invoking the `RecognizerRunner.resetRecognizers` function.
    -   A complete example of how to use BlinkIdCombinedRecognizer with still images has been added [here](examples/combined-file).

## 5.9.1

-   We've fixed NPM package which had obsolete UI component

## 5.9.0

### New additions to our supported documents list

-   53 documents added:

    -   ALBANIA - DL (front)
    -   BELGIUM - RESIDENCE PERMIT (front, back)
    -   BOLIVIA - ID (front, back)
    -   BOSNIA AND HERZEGOVINA - PASSPORT
    -   CAMBODIA - PASSPORT
    -   CANADA - RESIDENCE PERMIT (front, back)
    -   CANADA - MANITOBA - ID (front)
    -   CANADA - ONTARIO - HEALTH INSURANCE CARD (front)
    -   CHILE - ALIEN ID (front, back)
    -   CHINA - ID (front, back)
    -   COLOMBIA - MINORS ID (front, back)
    -   CYPRUS - RESIDENCE PERMIT (front, back)
    -   CZECHIA - PASSPORT
    -   GREECE - ID (front)
    -   HAITI - ID (front, back)
    -   ITALY - RESIDENCE PERMIT (front, back)
    -   LATVIA - DL (front)
    -   LATVIA - PASSPORT
    -   LITHUANIA - PASSPORT
    -   LUXEMBOURG - DL (front)
    -   MONTENEGRO - DL (front)
    -   MONTENEGRO - ID (front, back)
    -   MONTENEGRO - PASSPORT
    -   NETHERLANDS - RESIDENCE PERMIT (front, back)
    -   NICARAGUA - ID (front, back)
    -   NIGERIA - ID (front, back)
    -   NORWAY - RESIDENCE PERMIT (front, back)
    -   OMAN - RESIDENT ID (front, back)
    -   PARAGUAY - DL (front, back)
    -   PERU - DL (front, back)
    -   PHILIPPINES - SOCIAL SECURITY CARD (front)
    -   ROMANIA - PASSPORT
    -   RUSSIA - PASSPORT
    -   SERBIA - PASSPORT
    -   SLOVAKIA - PASSPORT
    -   SLOVENIA - PASSPORT
    -   SOUTH KOREA - DL (front)
    -   SPAIN - RESIDENCE PERMIT (front, back)
    -   SWEDEN - RESIDENCE PERMIT (front, back)
    -   THAILAND - PASSPORT
    -   UKRAINE - DL (front)
    -   UKRAINE - PASSPORT
    -   USA - ARKANSAS - ID (front, back)
    -   USA - CONNECTICUT - ID (front, back)
    -   USA - GREEN CARD (front, back)
    -   USA - MARYLAND - ID (front, back)
    -   USA - MINNESOTA - ID (front, back)
    -   USA - NEVADA - ID (front, back)
    -   USA - NEW YORK CITY - ID (front, back)
    -   USA - TEXAS - WEAPON PERMIT (front)
    -   USA - VIRGINIA - ID (front, back)
    -   VENEZUELA - DL (front)
    -   VENEZUELA - PASSPORT

-   Beta support added for 46 documents:

    -   ALBANIA - PASSPORT
    -   BAHAMAS - DL (front)
    -   BERMUDA - DL (front)
    -   BOLIVIA - DL (front)
    -   CHILE - DL (front)
    -   COLOMBIA - ALIEN ID (front)
    -   DENMARK - RESIDENCE PERMIT (front, back)
    -   DOMINICAN REPUBLIC - DL (front, back)
    -   ECUADOR - DL (front)
    -   EL SALVADOR - DL (front, back)
    -   ESTONIA - RESIDENCE PERMIT (front, back)
    -   GUATEMALA - DL (front, back)
    -   HAITI - DL (front)
    -   HONDURAS - DL (front, back)
    -   HONDURAS - ID (front, back)
    -   HUNGARY - ADDRESS CARD (front, back)
    -   HUNGARY - RESIDENCE PERMIT (front)
    -   ICELAND - DL (front)
    -   ISRAEL - ID (front, back)
    -   JAPAN - DL (front)
    -   JORDAN - DL (front)
    -   LATVIA - ALIEN PASSPORT
    -   LATVIA - RESIDENCE PERMIT (front, back)
    -   LUXEMBOURG - RESIDENCE PERMIT (front)
    -   MALTA - RESIDENCE PERMIT (front, back)
    -   MEXICO - BAJA CALIFORNIA - DL (front)
    -   MEXICO - CHIHUAHUA - DL (front)
    -   MEXICO - CIUDAD DE MEXICO - DL (front)
    -   MEXICO - PROFESSIONAL DL (front)
    -   MEXICO - GUANAJUATO - DL (front)
    -   MEXICO - MICHOACAN - DL (front)
    -   MEXICO - TAMAULIPAS - DL (front, back)
    -   MEXICO - VERACRUZ - DL (front, back)
    -   PHILIPPINES - TAX ID (front)
    -   PHILIPPINES - VOTER ID (front)
    -   POLAND - RESIDENCE PERMIT (front, back)
    -   PORTUGAL - RESIDENCE PERMIT (front, back)
    -   PUERTO RICO - VOTER ID (front)
    -   SLOVAKIA - RESIDENCE PERMIT (front, back)
    -   SOUTH KOREA - ID (front)
    -   SWITZERLAND - RESIDENCE PERMIT (front, back)
    -   TAIWAN - TEMPORARY RESIDENCE PERMIT (front)
    -   TURKEY - RESIDENCE PERMIT (front)
    -   USA - KANSAS - ID (front, back)
    -   VENEZUELA - ID (front)
    -   VIETNAM - DL (front)

-   Added back side support for 7 documents:

    -   ARGENTINA - ID
    -   ECUADOR - ID
    -   FINLAND - ID
    -   NIGERIA - DL
    -   QATAR - RESIDENCE PERMIT
    -   URUGUAY - ID
    -   USA - NEW YORK - DL

-   9 documents are no longer beta:
    -   BRAZIL - DL
    -   CANADA - ALBERTA - ID
    -   MALAYSIA - MyKAS
    -   MEXICO - NUEVO LEON - DL
    -   PANAMA - DL
    -   PORTUGAL - DL
    -   SAUDI ARABIA - ID
    -   SRI LANKA - ID
    -   USA - IDAHO - ID

### New features and updates to the BlinkId(Combined)Recognizer

-   We’re now able to read partial MRZ formats (2.5 lines), like the ones found on Switzerland and Liechtenstein DLs.
-   We’ve added `**documentOptionalAdditionalNumber**` to the main part of the result, as well as front and back side VIZ results.
-   We’ve expanded the set of possible recognizer states with `**StageValid**`. This state fixes `BlinkIDCombinedRecognizer` timeout issues, and enables better control of the Combined scanning pipeline. It activates when the first side of a document has been successfully scanned and scanning of the second side is required.

### Camera management updates

-   We've enabled camera image flipping
    -   Method `flipCamera` has been added to [`VideoRecognizer`](src/MicroblinkSDK/VideoRecognizer.ts).
    -   You can now let your users mirror the camera image vertically.
    -   By default, the UI component will display a flip icon in the top left corner once the camera is live.
-   We've improved camera management on devices with multiple cameras
    -   Method `createVideoRecognizerFromCameraStream` has been extended in [`VideoRecognizer` class](src/MicroblinkSDK/VideoRecognizer.ts).
    -   Attribute `[camera-id]` has been added to the UI component so that your users can preselect their desired camera.

### Fixes

-   We’ve fixed an uncommon bug where you’d get incomplete results upon scanning of the MRZ with the `allowUnparsed` setting enabled.
-   We've fixed a problem where the UI component would interfere with navigation strategy in SPA frameworks.
    -   Value of the `href` attribute in button elements has been changed to `javascript:void(0)`.

## 5.8.1

-   Fixed NPM package to include UI component.

## 5.8.0

### New additions to our supported documents list

#### Plastic page passports

We added support for scanning the visual inspection zone - VIZ includes everything except MRZ or barcode. Keep in mind that BlinkID scans and extracts data only from the VIZ that is on the first **plastic page** found in the passport list below:

-   **Chile** Passport (BETA)
-   **Colombia** Passport
-   **Croatia** Passport
-   **Denmark** Passport
-   **Finland** Passport (BETA)
-   **Germany** Passport
-   **Hong Kong** Passport (BETA)
-   **Ireland** Passport (BETA)
-   **Malaysia** Passport
-   **Netherlands** Passport
-   **New Zealand** Passport
-   **Norway** Passport
-   **Singapore** Passport
-   **South Africa** Passport
-   **Sweden** Passport
-   **Turkey** Passport (BETA)
    ​

#### Vertical US documents

-   **California** ID
-   **Illinois** ID
-   **New York** ID
-   **North Carolina** ID
-   **Texas** ID
    ​

#### Other documents

-   **Canada** Newfoundland and Labrador DL
-   **Croatia** Residence Permit (BETA)
-   **Guatemala** Consular ID
-   **Malaysia** MyKAS (BETA)
-   **Mexico** Jalisco DL / front side only
-   **Mexico** Nuevo Leon DL (BETA)
-   **Peru** ID (BETA)
-   **Singapore** S Pass (BETA)
-   **Uruguay** ID / front side only
-   **USA** Missouri ID
-   **USA** Texas ID

#### European DLs with a single line MRZ

BlinkID extracts data from driver’s licenses that contain single line MRZ:

-   **Croatia** DL
-   **Estonia** DL
-   **France** DL
-   **Ireland** DL
-   **Netherlands** DL
-   **Slovakia** DL

#### Back side supported on:

-   **Azerbaijan** ID
-   **Singapore** DL
-   **Singapore** Employment Pass

#### No longer BETA

-   **Slovakia** DL

### New features and updates in BlinkID(Combined)Recognizer

-   We added `signatureImage` to the result. Extract signature image from the documents below:

    -   Australia Victoria DL
    -   Austria ID
    -   Austria DL
    -   Brunei Military ID
    -   Colombia ID
    -   Croatia ID (on 2013 and 2015 versions)
    -   Cyprus ID
    -   Czechia ID (on the 2012 version)
    -   Germany ID (2010 version)
    -   Germany DL (2013 version)
    -   Indonesia ID
    -   Ireland DL
    -   Italy DL
    -   Mexico Voter ID
    -   New Zealand DL
    -   Slovenia ID
    -   Spain DL
    -   Sweden DL
    -   Switzerland ID
    -   UAE ID
    -   UAE Resident ID

-   We enabled extraction of the **date of birth** from the **NRIC** from Malaysian documents:

    -   MyKad
    -   MyKas
    -   MyKid
    -   MyPR
    -   MyTentera

-   We added anonymization support for:

    -   MRZ (OPT2 containing the ID number) on China Mainland Travel Permit Hong Kong
    -   MRZ (Document number) on Germany Alien Passport
    -   Document number, MRZ (Document number) on Germany ID
    -   MRZ (Document number) on Germany Minors Passport
    -   MRZ (Document number) on Germany Passport
    -   Document number on Hong Kong ID
    -   MRZ (Document number, OPT1 containing the passport or ID number) on Hong Kong Passport
    -   Personal ID number on Netherlands DL
    -   Personal ID number, MRZ (OPT1 containing the BSN) on Netherlands ID
    -   MRZ (OPT1 containing the BSN) on Netherlands Passport
    -   Document number on Singapore DL
    -   Personal ID number on Singapore Employment Pass
    -   Document number on Singapore FIN Card
    -   Document number on Singapore ID
    -   MRZ (Document number, OPT1 containing the NRIC) on Singapore Passport
    -   Document number on Singapore Resident ID
    -   Document number on Singapore S Pass
    -   Personal ID number on Singapore Work Permit
    -   MRZ (OPT1 containing the resident registration number) on South Korea Diplomatic Passport
    -   MRZ (OPT1 containing the resident registration number) on South Korea Passport
    -   MRZ (OPT1 containing the resident registration number) on South Korea Residence Passport
    -   MRZ (OPT1 containing the resident registration number) on South Korea Service Passport
    -   MRZ (OPT1 containing the resident registration number) on South Korea Temporary Passport

-   We improved MRZ data extraction on:

    -   **Russia Passport**

-   Added additional [recognizer options](src/Recognizers/BlinkID/Generic/BlinkIDRecognizer.ts):

    -   `BarcodeScanningStartedCallback` callback that is invoked when barcode recognition is started.
    -   `ClassifierCallback` callback that is invoked when document classification is completed.
    -   `allowedDocumentClasses` property which indicates whether the given document is supported or not.

-   Added support for filtering only specific document classes.

### UI component

-   We added a UI component in the format of a custom web element to use BlinkID on your web in an effortless way.
-   Check out the [README file](README.md) for instructions on how to use UI component, or check the [ui directory](/ui) for complete source code.

### Other features and updates

-   We added the field `middleName` to BlinkID(Combined)Recognizer, IDBarcodeRecognizer and USDL(Combined)Recognizer results. This field is extracted from AAMVA standard compliant barcodes, whenever available.

### Minor API changes

-   We removed `workerLocation` property from `WasmSDKLoadSettings`.
    -   Web worker is now inlined into the source code, which simplifies the SDK deployment and usage.
    -   Property `engineLocation` in `WasmSDKLoadSettings` **must** be an absolute path.
    -   Removed `useWebWorker` property from `WasmSDKLoadSettings`, since web worker is now always used as it provides much better user experience
        and does not block the UI browser thread.

### Fixes

-   We improved the data match logic for **Guatemala Consular ID** in BlinkID(Combined)Recognizer.
-   We fixed the initialization promise chain so that you can handle all initialization errors with a single error handler ([Issue #13](https://github.com/BlinkID/blinkid-in-browser/issues/13)).

## 5.7.0

### **New features:**

-   IDBarcodeRecognizer now returns:
    -   Street, postal code, city and jurisdiction.
-   In BlinkIDRecognizer and BlinkIDCombinedRecognizer, we added:
    -   Support for US driver licenses with **vertical** orientations:
        -   Alabama
        -   Arizona
        -   California
        -   Colorado
        -   Connecticut
        -   Georgia
        -   Illinois
        -   Iowa
        -   Kansas
        -   Kentucky
        -   Maryland
        -   Massachusetts
        -   Minnesota
        -   Missouri
        -   New Jersey
        -   Ohio
        -   Pennsylvania
        -   South Carolina
        -   Tennessee
        -   Texas
        -   Utah
        -   Washington
        -   Wisconsin
    -   **Support for new document types**:
        -   Croatia Health Insurance Card / front side / BETA
        -   Ecuador ID / front side
        -   El Salvador ID / BETA
        -   Sri Lanka ID / BETA
    -   **Driver licenses no longer in BETA**:
        -   Canada Nova Scotia
        -   Canada Yukon
        -   Norway
    -   **Back side** support:
        -   Kenya ID
    -   We added support for new MRZ formats on:
        -   Guatemala ID
        -   Kenya ID
        -   Mexico consular ID
        -   Northern Cyprus ID
        -   Chinese Mainland Travel Permits (Hong Kong, Macau and Taiwan)
-   Added **result anonymization**. With this option enabled, results are not returned for protected fields on documents listed here. The full document image will also have this data blacked out.
    -   Protected fields are:
        -   Document number on Hong Kong ID
        -   MRZ on Hong Kong passports and Chinese mainland travel permits for Hong Kong
        -   Personal ID number on Netherlands driver licence
        -   Personal ID number and MRZ on Netherlands ID
        -   MRZ on Netherlands passports
        -   Document number on Singapore driver license, ID, Fin Card, Resident ID
        -   Personal ID number on Singapore Employment Pass
        -   Document number and personal ID number on Singapore Work Permit
        -   MRZ on Singapore passports
    -   By using `setAnonymizationMode` method, you can choose the AnonymizationMode: `ImageOnly`, `ResultFieldsOnly`, `FullResult` or `None`.
    -   FullResult anonymization (both images and data) is set by default.

### **Improvements to existing features:**

-   We made changes to the result structure of BlinkIdCombinedRecognizer and BlinkIdRecognizer:
    -   Barcode data is now encapsulated in its own result structure: `BarcodeResult`.
    -   Data from all OCR-ed fields, without MRZ data, is now encapsulated in a `VIZResult` structure, representing the "Visual Inspection Zone" data. In BlinkIdCombinedRecognizer, front side data is available in its own structure (frontVizResult), back side data in its own (backVizResult), so you can now access data from each side separately.
    -   The main part of the result, outside these structures, is filled according to these rules:
        -   The document number is filled with MRZ data, if present.
        -   The remaining data is then filled from the barcode.
        -   The remaining data is filled from back side visual inspection zone (OCR data outside of MRZ).
        -   The remaining data is filled from the front side visual inspection zone.
        -   The remaining data is filled from the MRZ.
-   Members `colorStatus` and `moireStatus` can now be found in the result's `imageAnalysisResult` (`frontImageAnalysisResult` and `backImageAnalysisResult` in `BlinkIDCombinedRecognizer`).
-   We added **blur detection status** to `imageAnalysisResult`.
    -   We extended `ImageAnalysisResult` with information on whether the document contains a photo, MRZ and/or barcode.
        -   We renamed `DocumentImageMoireStatus` to `ImageAnalysisDetectionStatus` so it can be reused for other status information.
    -   We added a `RecognitionModeFilter` setting. This makes it possible to control for which group of documents (MrzId, MrzVisa, MrzPassport, PhotoId, FullRecognition) recognition is enabled or disabled.
    -   We added a `RecognitionMode` result member detailing which of the aforementioned recognition modes was used to obtain the result.
    -   We added a fallback method that extracts ‘sex’ and ‘nationality’ fields from the MRZ in case they aren’t present in the VIZ or the barcode. Previously, only ‘dates’, ‘names’ and ‘document numbers’ had the fallback method.
    -   Unsuccessfully parsed dates now preserve original string instead of returning empty string.

### **Bug fixes:**

-   We fixed US driver's license address extraction (Oregon, Mississippi, Rhode Island).
-   Added `ProcessingStatus` enumeration detailing why the result state was empty or uncertain.
-   Improved barcode error detection and correction.
-   Tweaked document detection feedback thresholds (that let the user know when the document is too close or too far away). This allows for a more natural scanning experience of passports in landscape mode, as the document can now be closer to the camera.

## 5.5.1

-   Removed `alert()` from [VideoRecognizer](src/MicroblinkSDK/VideoRecognizer.ts) and added `allowManualVideoPlayout` to constructor of `VideoRecognizer` class
-   Added `locateFile` method to [MicroblinkSDK](src/MicroblinkSDK/MicroblinkSDK.ts) to fix problem when SDK is not using web worker
-   File `package.json`
    -   Added field `engines` to explicitly specify Node version which was used during development
    -   Fixed typo in `repository` field so NPM package can be used with yarn, closes [#5](https://github.com/BlinkID/blinkid-in-browser/issues/5)
-   Documentation
    -   Added more information and renamed section "Optimal deployment of your web app" to "Deployment guidelines"
    -   Added links to Codepen examples and official demo app

## 5.5.0

-   Change of available recognizers
    -   Removed `MRTDRecognizer`
    -   Added `BlinkIdGenericRecognizer` and `BlinkIdCombinedRecoginzer`, with list of supported documents available in `docs/BlinkIdRecognizer.md`
-   Standardization of NPM package
    -   NPM package can be used in environments with module bundlers
    -   Added ES and UMD bundles for the SDK
    -   Types are now exposed and accessible in standard manner for NPM environment
    -   Extended `package.json` with project information and scripts for building and publishing
    -   Added Rollup build system to provide developers with infrastructure for easier customization of SDK
-   Extension of examples
    -   Examples now cover more functionalities of the SDK
    -   Provided examples for integration in TS, ES and UMD environment
-   Configuration options for WASM engine and WebWorker locations
    -   Configurations `engineLocation` and `workerLocation` are defined in the `WasmSDKLoadSettings` class
-   Improved stability and readability of SDK TypeScript source code
    -   Added ESLint for automatic check of unsecure language constructs
    -   Added Babel for safe transpiling to ES6 and better browser support

## 1.0.0-beta.1

-   decreased WASM binary size from 3.8 MB to 2.5 MB
-   fixed vulnerability in license check
-   added support for disabling hello message after license key gets validated
    -   by default this is still enabled, to disable it, set `allowHelloMessage` property in [WasmSDKLoadSettings](src/MicroblinkSDK/WasmLoadSettings.ts) to `false`
-   updates to [IdBarcodeRecognizer](src/Recognizers/BlinkID/IDBarcode/IdBarcodeRecognizer.ts):
    -   added `endorsements`, `restrictions` and `vehicleClass` fields to its result
        -   those fields are available only when scanning barcode from driver license
    -   added support for returning raw barcode data in case data parsing fails
        -   this requires a permission within a license key
    -   changed the behaviour of `firstName` field:
        -   now it contains both first name, middle name and name suffix

## 1.0.0-beta.0

-   initial beta release of the BlinkID In-browser SDK
-   supported recognizers:
    -   ID Barcode recognizer for scanning barcodes from various ID documents
    -   MRTD recognizer for scanning Machine Readable Zone (MRZ) from Machine Readable Travel Documents (MRTDs), such as IDs and passports
