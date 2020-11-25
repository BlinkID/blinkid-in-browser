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

    blinkId.licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPg4/w35CpJlWKGUQxY30CG/uEP4nsz1dBuqw2c1uTELZTAKhCtox46r9hcAG3pPYAWMZ82Thv2O1YC4V1eKCDo6yihFAshqtNNLbJrr/IWlxR9ynBhMhNUYBHS2xRoGUbrf9F9UMqocreyA7SgUjJ+SAxavED1Yn/uYUYTv8OcVNX0bap0mlrN4QOMxj5pe5MEBA+oNDGf+hGnrcH+usPDq68vDE3g43R9zkwLOVCnxN6hULxH666IEjDCvPu6uiPUt8JuP/Xw51rFb+x5RVZbOFRch4UosKnVY9kZUbFjXfILXUroikfw==";
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
