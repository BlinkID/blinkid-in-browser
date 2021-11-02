/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

// Import typings for UI component
import "@microblink/blinkid-in-browser-sdk/ui";

// Import typings for custom events
import { EventFatalError, EventScanError, EventScanSuccess } from "@microblink/blinkid-in-browser-sdk/ui/dist/types/utils/data-structures";
function initializeUiComponent() {
    const blinkId = document.querySelector("blinkid-in-browser") as HTMLBlinkidInBrowserElement;
    if (!blinkId) {
        throw "Could not find UI component!";
    }
    blinkId.licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpJlWKcUTzdcqWaRng1QSi5A9tEaYqYE/mrIgOWqqBpoxwfVLSrWbBwrL9V01hhfqjAfc4FEpsDVG9opmEMiZbyoL3xlWra/DsWDfRLZiw3B4uBT4Z1OJQbWMGVY8bUBT29UyKcM3fhhlw7zl6y84B6IGbiMuNasOBsaUXvo32zAJXYHabHkgwuNVoaLLiWmaQ52S5po16g1RVJP1gvBlHZiQfCruICGlKc+j3ld8jZNnkqiTykFP2mJHR6uPJfehwu/KJl866wZzsWUtGT+g15HXKoPtCQbtEItRPyCgEfPAsFkWO+1fgRnxTIa8zqDHpyzAzu91WmIi";
    blinkId.engineLocation = window.location.origin;
    blinkId.recognizers = ["BlinkIdRecognizer"];
    blinkId.addEventListener("fatalError", (ev: CustomEventInit<EventFatalError>) => {
        const fatalError = ev.detail;
        console.log("Could not load UI component", fatalError);
    });
    blinkId.addEventListener("scanError", (ev: CustomEventInit<EventScanError>) => {
        const scanError = ev.detail;
        console.log("Could not scan a document", scanError);
    });
    blinkId.addEventListener("scanSuccess", (ev: CustomEventInit<EventScanSuccess>) => {
        const scanResults = ev.detail;
        console.log("Scan results", scanResults);
    });
}

window.addEventListener("DOMContentLoaded", () => initializeUiComponent());
