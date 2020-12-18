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

    blinkId.licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpJlWLIUTxZO6heZwZ0ieAgWPdJbjL234+8kyLov9AmMYZU27gBbCKJ44GF7LxEO0L7YeysCJvf8VXD93eduMRFMwASjo7bwKCdcLY10azKaUKGfFors3peLh8cJ3xdpMZJB4NKxahGsq+V/jGmmjGt6m0YM+HWHXuZ5H9WyTJELTZrc9DVgUzjZLam3MaIcObAaOcQaGZELchW4E78RTBiL1IeU5rBE9A5fqRzvfeVsIEbMwHoESFtfhMiTk72KXDc+qyQ494NOiiAMUJ31XpolzxPIlpm3b8eIUhQrgaeLbDeEHV4h5BIdoQKzv";
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
