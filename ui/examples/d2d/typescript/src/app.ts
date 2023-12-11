/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

// Import typings for custom events
import
{
    SDKError,
    EventScanError,
    EventScanSuccess
} from "@microblink/blinkid-in-browser-sdk/ui/dist/types/utils/data-structures";

// Import typings for UI component
import "@microblink/blinkid-in-browser-sdk/ui";

function extractPeerIdFromURL() {
    const params = new URLSearchParams(location.search);
    const peerId = params.get("peerId") as string;

    return peerId;
}

function generatePeerUrl(peerId: string) {
    return window.location.href + `?peerId=${peerId}`;
}

function initializeUiComponent()
{
    const blinkId = document.querySelector( "blinkid-in-browser" ) as HTMLBlinkidInBrowserElement;

    if ( !blinkId )
    {
        throw "Could not find UI component!";
    }

    blinkId.licenseKey = "sRwAAAYhOTIwNC0xNDEtMTM4LTEwLTk0Lm5ncm9rLWZyZWUuYXBwxZ27b/OtDSy55QCAmS2wo0kYOo2BKrfk421Idixl1I6c2QLltaZvyR3dzca15cJU83+GB/jKlU8Dmv/H7gN3suLgkJwSVAUizN3D95f+ibtj+/ArLdYVnbh2MrHBanJRw5h1/fPXOClNgjcXhSJgSrlVR0GizXuL6MFRGvUhVDLK1dUx/P9n/yRrnOuPCbrSrA6FXtGRtlJCcZ7qVM0NyVpO+Hxi0/uUO6hzjyhCK9TUFyqoHnzVDgAq/qrqyOvNzLuZwc6z2JHzXKoC3L1VR0cRRtsIVXx0CAOt34XXQcnG0IcKLuhfHd+mpl8E7iqcHSzRJ5ilM5zrdPk=";
    blinkId.engineLocation = window.location.origin;
    blinkId.workerLocation = window.location.origin + "/BlinkIDWasmSDK.worker.min.js";
    blinkId.recognizers = [ "BlinkIdSingleSideRecognizer" ];

    blinkId.d2dOptions = {
        secure: true,
        host: "0.peerjs.com",
        port: 443,
        urlFactory: generatePeerUrl,
        peerIdExtractor: extractPeerIdFromURL,
    };

    blinkId.addEventListener( "fatalError", ( ev: CustomEventInit< SDKError > ) =>
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
