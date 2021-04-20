/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * BlinkID In-browser SDK demo app which demonstrates how to:
 *
 * - Change default SDK settings
 * - Scan front side of the identity document from image
 * - Provide visual feedback to the end-user during the scan
 */

// General UI helpers
const initialMessageEl = document.getElementById( "msg" );
const progressEl = document.getElementById( "load-progress" );
const scanImageElement = document.getElementById( "target-image");
const inputImageFile = document.getElementById( "image-file" );

/**
 * Check browser support, customize settings and load WASM SDK.
 */
function main()
{
    // Check if browser has proper support for WebAssembly
    if ( !BlinkIDSDK.isBrowserSupported() )
    {
        initialMessageEl.innerText = "This browser is not supported!";
        return;
    }

    // 1. It's possible to obtain a free trial license key on microblink.com
    let licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpJlWKzU9YHIiwa8JO/OCocwaxylMkWvKHrWXh18xYPoAweHAy4ThamUzV7aXC4qLPheqIE01+rGUOxh9UMVxnyVJ8VN9QI9MEuhdippTO/vs8kEeAAoqsc3iu4Hb8KNduzp6mdSbaC38eyp1bfl+tVQRXxRD775waHVYLvUEeUolgzrybVOEjgrKA6wtzWlJXwKOUmk4tUZJUwauaAyB9LtgsVW9OD4Q1aPPIjdag1n/a4LBzFq0qo7NaZlcpHMu1vCybBSuSmRBDyruzIOEdaV5BwV1b0FQNXsyE7vgg0K4eyG+Ar+OJLANGG9etiwJnX03ycJMZk28";

    if ( window.location.hostname === "blinkid.github.io" )
    {
        licenseKey = "sRwAAAYRYmxpbmtpZC5naXRodWIuaW+qBF9hPYYlTvZbRmaEOIXm3ZY6JuUWueHrbZMr5CHB/8yqAUMlydNc2fUb3CQKa2SB9kYOZ2CLBHwofUG5I1UN/2vw4tLkKF60VWtmsfUQQbkJ6oS6ehDtHFqX8Ba4p4B966tOtu42Bid2OdiqaH+clImmjl5logKfgQd6K2YKWREyYFCrsU5kIUd70Yx6Ou0XSSyudIDugLlDnQ257+Ko2mg7af0215dXpDQYljKd5rLZchG0Y2EuGDhMxvOP8QeboLCq/4cqM5i0Ezm0F39kVl9uI7LMOzuoP1LmfLOhgc3W38ixUCOt3NSqDbZKooU7fgRZ3JfW8/C65eOHCOhqpSo=";
    }

    // 2. Create instance of SDK load settings with your license key
    const loadSettings = new BlinkIDSDK.WasmSDKLoadSettings( licenseKey );

    /* [TEMPORARY FIX]
     * Use basic WebAssembly builds since most performant option requires server setup and unpkg.com, which is used
     * for examples, doesn't support COOP and COEP headers.
     *
     * For more information see "Integration" section in the official documentation.
     */
    loadSettings.wasmType = "BASIC";

    // [OPTIONAL] Change default settings

    // Show or hide hello message in browser console when WASM is successfully loaded
    loadSettings.allowHelloMessage = true;

    // In order to provide better UX, display progress bar while loading the SDK
    loadSettings.loadProgressCallback = ( progress ) => ( progressEl.value = progress );

    // Set absolute location of the engine, i.e. WASM and support JS files
    loadSettings.engineLocation = "https://unpkg.com/@microblink/blinkid-in-browser-sdk@5.11.1/resources/";

    // 3. Load SDK
    BlinkIDSDK.loadWasmModule( loadSettings ).then
    (
        ( sdk ) =>
        {
            document.getElementById( "screen-initial" )?.classList.add( "hidden" );
            document.getElementById( "screen-start" )?.classList.remove( "hidden" );
            document.getElementById( "image-file" )?.addEventListener( "change", ( ev ) =>
            {
                ev.preventDefault();
                startScan( sdk, ev.target.files );
            });
        },
        ( error ) =>
        {
            initialMessageEl.innerText = "Failed to load SDK!";
            console.error( "Failed to load SDK!", error );
        }
    );
}

/**
 * Scan single side of identity document with web camera.
 */
async function startScan( sdk, fileList )
{
    document.getElementById( "screen-start" )?.classList.add( "hidden" );
    document.getElementById( "screen-scanning" )?.classList.remove( "hidden" );

    // 1. Create a recognizer objects which will be used to recognize single image or stream of images.
    //
    // Generic ID Recognizer - scan various ID documents
    const genericIDRecognizer = await BlinkIDSDK.createBlinkIdRecognizer( sdk );

    // 2. Create a RecognizerRunner object which orchestrates the recognition with one or more
    //    recognizer objects.
    const recognizerRunner = await BlinkIDSDK.createRecognizerRunner
    (
        // SDK instance to use
        sdk,
        // List of recognizer objects that will be associated with created RecognizerRunner object
        [ genericIDRecognizer ],
        // [OPTIONAL] Should recognition pipeline stop as soon as first recognizer in chain finished recognition
        false
    );

    // 3. Prepare image for scan action - keep in mind that SDK can only process images represented in
    //    internal CapturedFrame data structure. Therefore, auxiliary method "captureFrame" is provided.

    // Make sure that image file is provided
    let file = null;
    const imageRegex = RegExp( /^image\// );
    for ( let i = 0; i < fileList.length; ++i )
    {
        if ( imageRegex.exec( fileList[ i ].type ) )
        {
            file = fileList[ i ];
        }
    }
    if ( !file )
    {
        alert( "No image files provided!" );
        // Release memory on WebAssembly heap used by the RecognizerRunner
        recognizerRunner?.delete();

        // Release memory on WebAssembly heap used by the recognizer
        genericIDRecognizer?.delete();
        inputImageFile.value = "";
        return;
    }

    scanImageElement.src = URL.createObjectURL( file );
    await scanImageElement.decode();
    const imageFrame = BlinkIDSDK.captureFrame( scanImageElement );

    // 4. Start the recognition and await for the results
    const processResult = await recognizerRunner.processImage( imageFrame );

    // 5. If recognition was successful, obtain the result and display it
    if ( processResult !== BlinkIDSDK.RecognizerResultState.Empty )
    {
        const genericIDResults = await genericIDRecognizer.getResult();
        if ( genericIDResults.state !== BlinkIDSDK.RecognizerResultState.Empty )
        {
            console.log( "BlinkIDGeneric results", genericIDResults );

            const firstName = genericIDResults.firstName || genericIDResults.mrz.secondaryID;
            const lastName = genericIDResults.lastName || genericIDResults.mrz.primaryID;
            const dateOfBirth = {
                year: genericIDResults.dateOfBirth.year || genericIDResults.mrz.dateOfBirth.year,
                month: genericIDResults.dateOfBirth.month || genericIDResults.mrz.dateOfBirth.month,
                day: genericIDResults.dateOfBirth.day || genericIDResults.mrz.dateOfBirth.day
            }

            alert
            (
                `Hello, ${ firstName } ${ lastName }!\n You were born on ${ dateOfBirth.year }-${ dateOfBirth.month }-${ dateOfBirth.day }.`
            );
        }
    }
    else
    {
        alert( "Could not extract information!" );
    }

    // 7. Release all resources allocated on the WebAssembly heap and associated with camera stream

    // Release memory on WebAssembly heap used by the RecognizerRunner
    recognizerRunner?.delete();

    // Release memory on WebAssembly heap used by the recognizer
    genericIDRecognizer?.delete();

    // Hide scanning screen and show scan button again
    inputImageFile.value = "";
    document.getElementById( "screen-start" )?.classList.remove( "hidden" );
    document.getElementById( "screen-scanning" )?.classList.add( "hidden" );
}

// Run
main();
