# UI component

BlinkID In-browser UI component acts as a UI layer built on top of core SDK. UI component is a customizable HTML element which provides a UI for scanning of various identity documents from images and from camera feed.

One of the main goals of UI component is to simplify integration of BlinkID in web apps for various use cases, and to provide high quality UX for end-users.

## Table of contents

* [Installation](#installation)
    * [Installation via CDN](#installation-cdn)
    * [Installation via NPM](#installation-npm)
    * [WASM resources](#installation-wasm-resources)
* [Usage](#usage)
    * [Minimal example](#usage-minimal)
    * [Advanced example](#usage-advanced)
    * [Examples and API documentation](#usage-examples-and-api-documentation)
* [Customization](#customization)
    * [UI customization](#customization-ui)
    * [UI customization with `::part()` pseudo-element](#customization-ui-css-part)
    * [Custom icons](#customization-icons)
    * [Localization](#customization-localization)
        * [RTL support](#customization-rtl-support)

## <a name="installation"></a> Installation

To use the UI component, JS file with custom element must be loaded and WASM engine must be available.

### <a name="installation-cdn"></a> Installation via CDN

Since the UI component is published on NPM, it's possible to download the JavaScript bundles via public CDN services.

However, **we strongly advise** that you host the JavaScript bundles on your infrastructure since there is no guarantee that the public CDN service has satisfactory uptime and availability throughout the world.

```html
<!-- Load custom element via `<script>` tag with fallback for older browsers -->
<!-- IMPORTANT: change "X.Y.Z" to the version number you wish to use! -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@microblink/blinkid-in-browser-sdk@X.Y.Z/ui/dist/blinkid-in-browser/blinkid-in-browser.esm.js"></script>
<script nomodule src="https://cdn.jsdelivr.net/npm/@microblink/blinkid-in-browser-sdk@X.Y.Z/ui/dist/blinkid-in-browser.js"></script>

<!-- Custom element is now available and location of WASM engine must be provided -->
<!-- IMPORTANT: location of the engine must be an absolute path. See section "WASM resources" for more information about this property. -->
<blinkid-in-browser license-key="..." engine-location="http://localhost/resources/"></blinkid-in-browser>
```

*Keep in mind that the jsDelivr CDN is used for demonstration, it's not intended to be used in production!*

### <a name="installation-npm"></a> Installation via NPM

```sh
# Install latest version of UI component via NPM or Yarn
npm install @microblink/blinkid-in-browser-sdk # OR yarn add @microblink/blinkid-in-browser-sdk

# Copy JS file to folder where other JS assets are located
cp -r node_modules/@microblink/blinkid-in-browser-sdk/ui/dist/* src/public/js/

# Copy WASM resources from SDK to folder where other static assets are located
cp -r node_modules/@microblink/blinkid-in-browser-sdk/resources/* src/public/assets/
```

```html
<!-- Load custom element via `<script>` tag -->
<script type="module" src="public/js/blinkid-in-browser/blinkid-in-browser.esm.js"></script>

<!-- Custom element is now available and location of WASM engine must be provided -->
<!-- IMPORTANT: location of WASM engine must be an absolute path
<blinkid-in-browser license-key="..." engine-location="http://localhost/public/assets/"></blinkid-in-browser>
```

### <a name="installation-wasm-resources"></a> WASM resources

After adding the BlinkID UI component to your project, make sure to include all files from BlinkID In-browser SDK package and its `resources` folder in your distribution. Those files contain compiled WebAssembly module and support JS code.

Do not add those files to the main app bundle, but rather place them on a publicly available location so SDK can load them at the appropriate time. For example, place the resources in `my-angular-app/src/assets/` folder if using `ng new`, or place the resources in `my-react-app/public/` folder if using `create-react-app`.

To load WebAssembly module, use `engine-location` attribute or `engineLocation` property on the UI component.

#### Downloading WASM resources from CDN

If you're not using NPM, it's possible to download WASM resources from public CDN services.

For example, all versions of BlinkID In-browser SDK are available on the jsDelivr CDN:

* Visit `https://cdn.jsdelivr.net/npm/browse/@microblink/blinkid-in-browser-sdk@X.Y.Z/resources/` (change "X.Y.Z" to the version number you wish to use).
* Download the whole folder.
* Save everything in the local `resources` folder which is available through HTTP/S.
* Point the engine to that location with `engine-location` attribute or `engineLocation` property on the UI component.

### <a name="installation-angular"> Integration with Angular

1. Install BlinkID In-browser SDK as NPM dependency with `npm install --save @microblink/blinkid-in-browser-sdk`.

2. Setup Angular to automatically copy BlinkID In-browser SDK assets to public location. Add the following code to `angular.json` inside `projects.<projectName>.architect.build.options.assets` array:

```JSON
{
  "glob": "**/*",
  "input": "node_modules/@microblink/blinkid-in-browser-sdk/resources",
  "output": "/blinkid-resources/"
}
```

3. Add `CUSTOM_ELEMENTS_SCHEMA` to `app.module.ts` (or main application module) to allow usage of custom HTML elements.

4. Call `defineCustomElements()` in `main.ts`:

```typescript
import { defineCustomElements } from '@microblink/blinkid-in-browser-sdk/ui/loader';

...

defineCustomElements();
```

5. Here's one possible way to use `<blinkid-in-browser>` custom web component inside Angular:

```typescript
import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';

// Import typings for the UI component
import '@microblink/blinkid-in-browser-sdk/ui';

// Import typings for custom events
import {
  EventReady,
  EventScanError,
  EventScanSuccess,
  SDKError
} from '@microblink/blinkid-in-browser-sdk/ui/dist/types/utils/data-structures';

@Component({
  selector: 'my-component',
  template: '<blinkid-in-browser #el></blinkid-in-browser>',
  styleUrls: ['./my-component.component.scss']
})
export class MyComponent implements AfterViewInit {
  // Reference to the `blinkid-in-browser` custom web component
  @ViewChild('el') el!: ElementRef<HTMLBlinkidInBrowserElement>;

  constructor() {}

  ngAfterViewInit(): void {
    this.el.nativeElement.licenseKey = '<PLACE-YOUR-LICENSE-KEY-HERE>';
    this.el.nativeElement.recognizers = [ 'BlinkIdSingleSideRecognizer' ];

    // Engine location depends on the actual location of WebAssembly resources
    this.el.nativeElement.engineLocation = window.location.origin + '/blinkid-resources/';
    this.el.nativeElement.workerLocation = window.location.origin + `/resources/blinkid.worker.min.js`;

    this.el.nativeElement.addEventListener('ready', (ev: CustomEventInit<EventReady>) => {
      console.log('ready', ev.details);
    });

    this.el.nativeElement.addEventListener('scanSuccess', (ev: CustomEventInit<EventScanSuccess>) => {
      console.log('scanSuccess', ev.details);
    });

    this.el.nativeElement.addEventListener('scanError', (ev: CustomEventInit<EventScanError>) => {
      console.log('scanError', ev.details);
    });

    this.el.nativeElement.addEventListener('fatalError', (ev: CustomEventInit<SDKError>) => {
      console.log('fatalError', ev.details);
    });
  }
}
```

### <a name="installation-react"> Integration with React

1. Install BlinkID In-browser SDK as NPM dependency with `npm install --save @microblink/blinkid-in-browser-sdk`.

2. Copy WebAssembly resources to to public location. This is one possible approach:

```
# Auxiliary tool for cross-platform support
$ npm install --save-dev shx
```

```json
# Add `postinstall` hook to `package.json` that will copy resources
{
    ...
    "scripts": {
        ...
        "postinstall": "shx cp -r node_modules/@microblink/blinkid-in-browser-sdk/resources public"
        ...
    },
    ...
}
```

3. Here's one possible way to use `<blinkid-in-browser>` custom web component inside React:

```jsx
import React from 'react';

import {
  applyPolyfills,
  defineCustomElements
} from '@microblink/blinkid-in-browser-sdk/ui/loader';

function App() {
  // Reference to the `<blinkid-in-browser>` custom web component
  const el = React.useRef(null);

  React.useEffect(() => {
    applyPolyfills().then(() => {
      defineCustomElements().then(() => {
        el.current.licenseKey = '<PLACE-YOUR-LICENSE-KEY-HERE>';
        el.current.recognizers = [ 'BlinkIdSingleSideRecognizer' ];

        // Engine location depends on the actual location of WebAssembly resources
        el.current.engineLocation = window.location.origin + '/resources';
        el.current.engineLocation = window.location.origin + `/resources/blinkid.worker.min.js`;

        el.current.addEventListener('ready', (ev) => {
          console.log('ready', ev.details);
        });

        el.current.addEventListener('scanSuccess', (ev) => {
          console.log('scanSuccess', ev.details);
        });

        el.current.addEventListener('scanError', (ev) => {
          console.log('scanError', ev.details);
        });

        el.current.addEventListener('fatalError', (ev) => {
          console.log('fatalError', ev.details);
        });
      });
    });
  }, []);

  return (
    <blinkid-in-browser ref={el}></blinkid-in-browser>
  );
}

export default App;
```

## <a name="usage"></a> Usage

BlinkID UI component acts as any other HTML element. It has custom attributes, properties and events.

Required parameters are license key, engine location and one or more recognizers.

* **License key**
    * To use this SDK, a valid license key is required. Please check the main README file of this repository for more information.
* **Engine location**
    * This SDK uses WASM engine in the background for image processing. Please check the [WASM resources](#installation-wasm-resources) section for more information.
* **Recognizer**
    * The `Recognizer` is the basic unit of processing within the BlinkID SDK. Its main purpose is to process the image and extract meaningful information from it.
    * Please check the main README file of this repository for a list of available recognizers.

### <a name="usage-minimal"></a> Minimal example

```html
<blinkid-in-browser
    engine-location="http://localhost/resources"
    license-key="<PLACE-YOUR-LICENSE-KEY-HERE>"
    recognizers="BlinkIdSingleSideRecognizer"
></blinkid-in-browser>

<script>
    // Register listener for successful scan event to obtain results
    const el = document.querySelector('blinkid-in-browser');

    el.addEventListener('scanSuccess', ev => {
        // Since UI component uses custom events, data is placed in `detail` property
        console.log('Results', ev.detail);
    });
</script>
```

### <a name="usage-advanced"></a> Advanced example

```html
<!-- UI component can be customized with JS attributes or HTML properties -->
<blinkid-in-browser></blinkid-in-browser>

<script>
    const el = document.querySelector('blinkid-in-browser');

    /**
     * Mandatory properties
     */

    // Absolute path to location of WASM resource files
    el.engineLocation = 'http://localhost/resources';
    el.workerLocation = 'http://localhost/resources/blinkid.worker.min.js';

    // License key
    el.licenseKey = '<PLACE-YOUR-LICENSE-KEY-HERE>';

    // Recognizers - logic which should be used to extract data
    el.recognizers = ['BlinkIdSingleSideRecognizer'];

    /**
     * Optional properties
     *
     * See docs/components/blinkid-in-browser/readme.md for more information.
     */
    el.allowHelloMessage     = true;
    el.recognizerOptions     = undefined;
    el.enableDrag            = true;
    el.hideFeedback          = false;
    el.hideLoadingAndErrorUi = false;
    el.scanFromCamera        = true;
    el.scanFromImage         = true;
    el.cameraId              = null;
    el.translations          = undefined;
    el.iconCameraDefault     = undefined;
    el.iconCameraActive      = undefined;
    el.iconGalleryDefault    = undefined;
    el.iconGalleryActive     = undefined;
    el.iconInvalidFormat     = undefined;
    el.iconSpinner           = undefined;

    el.translations = {
        'action-message': 'Alternative CTA'
    }

    /**
     * Events
     */

    // Event emitted when UI component cannot initialize
    el.addEventListener('fatalError', ev => {
        console.log('fatalError', ev.detail);
    });

    // Event emitted when UI component is ready to use
    el.addEventListener('ready', ev => {
        console.log('ready', ev.detail);
    });

    // Event emitted in case of error during scan action
    el.addEventListener('scanError', ev => {
        console.log('scanError', ev.detail);
    });

    // Event emitted when scan is successful
    el.addEventListener('scanSuccess', ev => {
        console.log('scanSuccess', ev.detail);
    });

    // Event emitted when UI component wants to display a feedback message to the user
    el.addEventListener('feedback', ev => {
        console.log('feedback', ev.detail);
    });
</script>
```

### <a name="usage-examples-and-api-documentation"></a> Examples and API documentation

A demo app with multiple UI components alongside with source code can be found in the [demo.html](demo.html) file.

Example apps are located in the [examples](examples) directory, where minimal JavaScript example is located in the [examples/javascript](examples/javascript) directory, while the minimal TypeScript example is located in the [examples/typescript](examples/typescript) directory.

Auto-generated API documentation of UI component is located in the [docs](docs) directory.

## <a name="customization"></a> Customization

All attributes, properties and events of UI component can be seen in [`<blinkid-in-browser>` API documentation](docs/components/blinkid-in-browser/readme.md).

### <a name="customization-ui"></a> UI customization

UI component relies on CSS variables which can be used to override the default styles.

All CSS variables are defined in [\_globals.scss](src/components/shared/styles/_globals.scss) file.

```css
/**
 * Example code which modifies default values of CSS variables used by an
 * instance of UI component.
 */
blinkid-in-browser {
    --mb-font-family:           inherit;
    --mb-component-background:  #FFF;
    --mb-component-font-color:  #000;
    --mb-component-font-size:   14px;
}
```

### <a name="customization-ui-css-part"></a> UI customization with `::part()` pseudo-element

All internal components are exposed, and can be modified with CSS [`::part()`](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) pseudo-element.

Right now, the only way to see available parts is to explore the DOM and look for the `part` attribute.

```css
/* Change the background color of every overlay element */
blinkid-in-browser::part(mb-overlay) {
    background-color: green;
}

/* Change the background color of a specific overlay element */
blinkid-in-browser::part(mb-overlay-camera-experience) {
    background-color: yellow;
}
```

### <a name="customization-icons"></a> Custom icons

It's possible to change the default icons used by the UI component during configuration.

```javascript
const el = document.querySelector('blinkid-in-browser');

// Value provided to this property will be used for setting the `src` attribute
// of <img> element.
el.iconSpinner = '/images/icon-spinner.gif';
```

For a full list of customizable icons, see [`<blinkid-in-browser>` API documentation](docs/components/blinkid-in-browser/readme.md).

### <a name="customization-localization"></a> Localization

It's possible to override the default messages defined in the [translation.service.ts](src/utils/translation.service.ts) file.

```javascript
const el = document.querySelector('blinkid-in-browser');

el.translations = {
    'action-message': 'Alternative CTA',

    // During the camera scan action, messages can be split in multiple lines by
    // providing array of strings instead of a plain string.
    'camera-feedback-scan-front': ['Place the front side', 'of a document']
}
```

#### <a name="customization-rtl-support"></a> RTL support

To use UI component in RTL interfaces, explicitly set `dir="rtl"` attribute on HTML element.

```html
<blinkid-in-browser ... dir="rtl"></blinkid-in-browser>
```
