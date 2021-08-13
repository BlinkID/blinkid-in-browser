/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

// Import typings for UI component
import "@microblink/blinkid-in-browser-sdk/ui";

// Import typings for custom events
import
{
    EventFatalError,
    EventScanError,
    EventScanSuccess
} from "@microblink/blinkid-in-browser-sdk/ui/dist/types/utils/data-structures";

function initializeUiComponent()
{
    const blinkId = document.querySelector( "blinkid-in-browser" ) as HTMLBlinkidInBrowserElement;

    if ( !blinkId )
    {
        throw "Could not find UI component!";
    }

    blinkId.licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpJlWLwUXzc13MgbQysNTFBthvxVSliQsXWC9ije7mINWimr2aX7qmiW6I6LAZVZ0QS5BG9CPQFsPH+rB5GEI4M5vfPDNdl7tceIBuJhBp6DPDoBYWQ2HYZvfrL3q3nwwh8BM5kKDFL3+wtPPVWo9qxjxFaDQBiZDoKx8MpA+6yAcd6hV7La+XOrYuRBF3NVWw0Y5oLrvvfSRsqg1+j7hjdcuGUJEWzi9bMJ5B52yD5fMq5ROKKFsv0BVzYExi0UO1yoag5yPh3JemgI0TDhW98IBt3/QTzLW16KcemTariq7WdhesQPw65DaCLH0dOn2fSvRF84Au91v";
    blinkId.engineLocation = window.location.origin;
    blinkId.recognizers = [ "BlinkIdRecognizer" ];

    blinkId.addEventListener( "fatalError", ( ev: CustomEventInit< EventFatalError > ) =>
    {
        const fatalError = ev.detail;
        console.log( "Could not load UI component", fatalError );
    });

    blinkId.addEventListener( "scanError", ( ev: CustomEventInit< EventScanError > ) =>
    {
        const scanError = ev.detail;
        console.log( "Could not scan a document", scanError );
    });

    blinkId.addEventListener( "scanSuccess", ( ev: CustomEventInit< EventScanSuccess > ) =>
    {
        const scanResults = ev.detail;
        console.log( "Scan results", scanResults );
    });
}

window.addEventListener( "DOMContentLoaded", () => initializeUiComponent() );
