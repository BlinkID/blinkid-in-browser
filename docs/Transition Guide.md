# Transition guide to BlinkID v6.0.0

## Breaking changes

### Renaming of recognizers

* One very important change came when it comes to using BlinkID recognizers - they have been renamed to make them more understandable for new developers and users:
    * Basic single-sided recognizer, which used to be named `BlinkIdRecognizer`, is now called __BlinkIdSingleSideRecognizer__, and should be used for scanning one-sided documents or if you wish to capture only the front side of it
    * More advanced recognizer, which used to be named `BlinkIdCombinedRecognizer`, is now called __BlinkIdMultiSideRecognizer__, and should be used for scanning the documents which have information that you want to extract on more than one side

## API changes

#### Structure `StringResult`

* `BlinkIdSingleSideRecognizer` and `BlinkIdMultiSideRecognizer` results now return nullable `StringResult` instead of `string` for the text fields, supporting multiple scripts. If we don't expect the `StringResult` on the document, that result will be `null`. If the text field is expected on the document, but we did't manage to read it, the `StringResult` will contain empty `string`.  

#### Structure `DateResult`

* `BlinkIdSingleSideRecognizer` and `BlinkIdMultiSideRecognizer` results now return nullable `DateResult` instead of `string` for the date fields, supporting multiple scripts. If we don't expect the `DateResult` on the document, that result will be `null`. If the date field is expected on the document, but we did't manage to read it, the `DateResult` will contain empty `string`.

#### Other changes

* We have added `CardOrientation` result that can help you distinguish between `Vertical` and `Horizontal` documents. It is a part of the `ImageAnalysisResult` result.
* We have added new result property of an `AdditionalProcessingInfo` type that provides information about `missingMandatoryFields`, `invalidCharacterFields`, and `extraPresentFields`
* We have unified `DataMatchResult` and `DataMatchDetailedInfo` into a single structure `DataMatchResult` (removed `dataMatchDetailedInfo` result member)
