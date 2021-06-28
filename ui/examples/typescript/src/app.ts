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

    blinkId.licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpJlWK6UdzadwYSEZlshDSzAKA3GGbItdpzvAeanNv5uBeJuOSOT5YeqqTP+Ejn1DNw1m5u9X69/+7Myj+lu+lw7Hk2t8IU7Qqm6arDYxmLU4CzaFsR886TPcWZBB94J+cTSeWHFUnHYhs51hV6wGv9SMHXJtvJ4V6N2O4sD4OiOGe4hGZpCgQffPa20LBGmgvrvPslgRhy5/S54q7AMnMh7Gc1BmuFqximeVSnUr4fWpr4yF37Zu26zt6cLXNsPOPhVGjhw8LL/ywPO4tGuzfyvndktOKSf9fTM8HzsWi1sN+KPc/lbQBmIUjUtnHcw2RXSrfGb+5DlMFQ==";
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
