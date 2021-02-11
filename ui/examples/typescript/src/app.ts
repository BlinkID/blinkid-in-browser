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

    blinkId.licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpJlWLC04YOZP6o4omehP4Kw61GsKVR5+hnhdmJM0Jl3uPIjDdf2G2jTObySnuUJybl5Gtls64/fJrq74wM7tQj9fdN+uaOcwKw6bTeO0MAXABpAgPju+JcPnlsbqm4mKIN/BQ4TX+FV5MPQB/NotnGYBzdk3jaf+D1YnJcEuTgAs7Oz8bY58MKSxAFSBntni8hznFa9neQypvnBrPE2IA7p0hDNewzyVD7QLU8t2/4Q535Alm80JR3xFT+9qLRraWUb85cKEDSE1PF/rT/0CJE3J5XiJWBBbgL43ioliTlfpP9hfAylphEwtazUU3Io=";
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
