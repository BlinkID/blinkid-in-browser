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

    blinkId.licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPig/w35CpJnWKmMezUjG2iJrUNT3apaewMTaVKaMGOw0jBgCJnqPawuszZTY9KnqfdA+M3uPXbMpFZkj2FmSVqjtqrRhxjsul6HzP6Pzu/hDDpraYh8n29ASxzs5rZOEaoOIh1sLg8Lla40FA/PQEJOGX/hZXbqHO/EbdEEbH0D0/h6SpBs2O6Gb8XRQtqi/gu5C8LkUeMTgcKOciHcFnG2S591BSFkpWR+sexoKFwpKxhl1WfuWdfcl/C54mq1D1vZXAAg=";
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
