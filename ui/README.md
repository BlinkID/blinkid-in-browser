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
* [Device-to-device (D2D) - BETA](#d2d)
    * [Usage scenarios](#d2d-usage)
    * [Setup](#d2d-setup)
    * [Configuration](#d2d-configuration)
    * [Why is this beta?](#d2d-beta)

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

## <a name="d2d"></a> Device-to-device (D2D) - BETA

The idea behind the device-to-device (D2D) feature is to provide extraction functionality when the initial device has technical limitations like no camera or no support for WebAsembly. Also, it can be used to direct users to use mobile instead of web cameras for a better scanning experience. Being optimized for conference calls, web cameras often struggle with a focus which causes the image of a document to have a high level of blur thus making it hard to read.

D2D can achieve these goals without the need to restart the existing process, such as form filling. When D2D is used, the scanning process is moved from a problematic device to another auxiliary device that has the necessary requirements or better camera quality. There, the scanning will take place, and the extracted results will be sent directly between the initial and auxiliary device browsers without sending images or result data to a Microblink server.

This feature has undergone thorough testing in various environmental scenarios, including different WiFi and mobile networks, using a variety of desktop and mobile devices. Currently, there are no known bugs, and it functions properly. However, it is important to note that the complexity of this feature, primarily due to the sensitivity of P2P communication and the configuration of necessary signaling and STUN servers, may result in some networks with high security, such as those with strict firewall policies, preventing communication between peers. Since these environments can differ significantly and are somewhat beyond our control, we consider this feature to be in the BETA state until we gain a better understanding and can precisely specify the cases in which D2D may not be possible.

### <a name="d2d-usage"></a> Usage scenarios

The D2D feature can be activated in the following usage scenarios:

* **The initial device doesn’t have a web camera device (nor WebAssembly support)**
    * To use the D2D feature, the auxiliary device has to have a web camera device and WebAssembly support.
* **The initial device has WebAssembly support, but poor quality web camera device**
    * To use the D2D feature, the auxiliary device has to have a web camera device and WebAssembly support.

### <a name="d2d-setup"></a> Setup

* **Frontend**

    * Our UI component is being used for the initial and auxiliary devices.
        -  Scenario: *myapp.com* can instantiate the initial and the auxiliary UI component.
        -  Scenario: the initial UI component is on *myapp.com*, while the auxiliary UI component is on *d2d.myapp.com*, the same UI component is used for both web locations.

* **Backend**

    A single backend service needs to be set up.

    The D2D feature is based on [PeerJS](https://peerjs.com) - a JavaScript library that simplifies peer-to-peer (P2P) communication between web browsers via WebRTC technology. 
    It uses a signaling server and STUN servers to establish P2P connections between peers (devices). Data is sent directly between the browsers of connected devices (peers).

    * **Signaling server**

        - By default, the PeerJS library uses the [PeerJS server](https://github.com/peers/peerjs-server) for signaling. The PeerJS server has the role of a central server (signaling server) for mediating communication between peers. It itself does not retain data or have insight into data sent via a P2P connection.
            
            When two peers want to establish a P2P connection, they use the PeerJS server to exchange signaling data, such as information about identity, availability, and technical details of the connection. This signaling data helps peers find each other and establish a direct P2P connection.

            Once a P2P connection is established, data is sent directly between peers, bypassing the PeerJS server. The PeerJS server is no longer involved in data transfer. Data is transferred directly between peers, usually via WebRTC technology, which enables secure and fast data transfer between browsers.

            The PeerJS server only acts as an intermediary in the process of establishing a P2P connection but does not retain or have insight into the data transmitted between peers. This means that data privacy and security depend on the P2P connection itself, not on the PeerJS server.

        - The PeerJS server is an open-source server implemented in Node.js that is available as a separate project. You can run it on your own server or use hosting services that support Node.js applications. The PeerJS server allows peers to register with a unique ID, exchange messages through the server, and use it to discover and connect with other peers.

        - The PeerJS library and PeerJS server are independent projects. The PeerJS library is a JavaScript library used on the client side for peer-to-peer communication, while the PeerJS server is software that enables peer-to-peer connections to.

    * **STUN servers**

        - A STUN (Session Traversal Utilities for NAT) server is a key element in facilitating communication between two devices behind NAT (Network Address Translation) devices, such as routers or firewalls. NAT devices assign private IP addresses to devices within the local network while using public IP addresses to communicate with the Internet.

        - When two devices try to establish a direct communication channel, they may face problems due to NAT. NAT devices change the source IP addresses and ports of incoming packets to properly deliver them within the local network. However, this makes it difficult to establish direct connections between two devices because their actual IP addresses and ports are not visible outside the local network. In such situations, the STUN server acts as an intermediary between the two devices.

        - PeerJS has built-in default STUN servers that it uses if you have not explicitly defined other servers through the settings. The PeerJS library uses STUN servers to discover the external IP addresses and ports of peers to enable P2P connections.
    
        - **Firewall**
            
            - A firewall can be one of the factors preventing successful P2P communication between devices, even if PeerJS is being used correctly. Firewalls are designed to control traffic entering and leaving a network and can block or restrict certain types of communication, including P2P communication.

            - Here are some reasons why a firewall can affect P2P communication:

                - Blocking certain protocols or ports: The firewall can block certain protocols or ports that are required for P2P communication. For example, if a certain port is used that is blocked on the firewall, the communication will not go through.
                - Blocking inbound traffic: A firewall can be configured to block inbound traffic coming from the Internet, and P2P communication usually involves establishing a connection between peers that are behind a NAT. If incoming traffic is blocked, peers from different networks will not be able to communicate.
                - NAT traversal restrictions: Firewalls can use special security mechanisms, such as SIP ALG (Application Layer Gateway), which can change data in packets to maintain security policies. However, such mechanisms can negatively affect P2P communication that relies on data consistency and integrity.

            - If you are experiencing problems with P2P communication using PeerJS, we recommend checking your firewall configuration to ensure that traffic required for P2P communication is not being blocked. You may need to open certain ports or configure your firewall to allow P2P traffic to pass through. Also, make sure the STUN server is turned on to enable the discovery of public IP addresses and ports. If necessary, consult your network administrator or service provider to configure the firewall appropriately.

    For more information, see the official [PeerJS](https://peerjs.com) documentation and/or the [PeerJS server](https://peerjs.com/peerserver) documentation.

### <a name="d2d-configuration"></a> Configuration

```html
<blinkid-in-browser
    engine-location="http://localhost/resources"
    license-key="<PLACE-YOUR-LICENSE-KEY-HERE>"
    recognizers="BlinkIdSingleSideRecognizer"
></blinkid-in-browser>
```
```javascript
<script>
    // Register listener for successful scan event to obtain results
    const el = document.querySelector('blinkid-in-browser');

    function extractPeerIdFromURL() {
        const params = new URLSearchParams(location.search);
        const peerId = params.get('peerId');

        return peerId;
    }

    function generatePeerUrl(peerId) {
        return window.location.href + `?peerId=${peerId}`;
    }

    el.d2dOptions = {
        secure: true,
        host: 'my-peerjs-server.com',
        port: 443,
        urlFactory: generatePeerUrl,
        peerIdExtractor: extractPeerIdFromURL,
    };

    el.addEventListener('scanSuccess', ev => {
        // Since UI component uses custom events, data is placed in `detail` property
        console.log('Results', ev.detail);
    });
</script>
```

The D2D feature is configured through the `d2dOptions` setting, which contains the following properties:

* `secure`
    - Indicates whether the connection between peers will be established through the secure HTTPS protocol.

        When set to `true`, the PeerJS library will use the HTTPS protocol to establish a connection between peers. This ensures that communication takes place over an encrypted connection, which helps protect the privacy and security of data transmitted between peers.

        If not specified or set to `false` (which is the default), PeerJS will use the standard HTTP protocol for peer-to-peer communication. In this case, the connection is not encrypted, and there may be a greater risk of eavesdropping or data manipulation during transmission.

    - Note that to use the HTTPS protocol, the PeerJS signaling server should be configured and accessible via HTTPS.

* `host`

    - URL or IP address of the server that will be used for signaling and mediating communication between peers. In this way, peers will use a specific PeerJS server as a central server for exchanging signaling data and managing P2P connections.

    - In this example, the `host` property is set to *'my-peerjs-server.com'*, indicating that the PeerJS library will use that server to signal and mediate communication between peers.
        
        If set to `0.peerjs.com`, then the PeerJS library is going to automatically connect to the default [PeerServer Cloud](https://peerjs.com/peerserver) service.

    - STUN servers are usually automatically detected and used by the PeerJS library and do not need to be explicitly configured via host settings. The PeerJS library has built-in default STUN servers that it uses if no other STUN servers are specified through the settings.

* `port`

    - Indicates the TCP port that will be used for peer-to-peer communication.

        When defined, the PeerJS library will try to use that particular TCP port to establish a connection between peers. This allows the desired port to be specified and used for P2P communication.

        If not specified, the PeerJS library will automatically select an available free TCP port for communication.

    - Note that if you are using a PeerJS server, it is necessary to ensure that the same TCP port is open on the server so that peers can establish connections through that port. Also, if you use hosting or a firewall, you should check whether the selected port is allowed for communication between peers.

* `urlFactory`

    - Represents a function used to generate a URL or address that will be used to establish a P2P connection between peers. 

        This allows each peer to have a unique URL and identifier (peerId) used to establish a connection with other peers.

    - In this example, the `generatePeerUrl` function is defined as `urlFactor`. It takes `peerId` as an input parameter and generates a URL containing that peerId. The generated URL is used to identify peers and exchange information about them during P2P connection establishment.

        The `generatePeerUrl` function uses `window.location.href` to retrieve the current URL and then adds the peerId as a query parameter. 

    - This generated URL is used to display the QR code (through the QRCode library) on the canvas to allow scanning of the URL with another device and establishing a peer-to-peer P2P connection.

* `peerIdExtractor`

    - Represents a function used to extract the `peerId` value from the current URL or other source information.

        This allows a corresponding `peerId` to be associated with each peer to establish a connection between them and enable P2P communication.

    - In this example, the `extractPeerIdFromURL` function is defined as `peerIdExtractor`. It uses the `URLSearchParams` object to retrieve the `peerId` value from the current URL. The function retrieves the parameters from the URL query and then retrieves the `peerId` value using the `get('peerId')` method.

    - This function is used to retrieve a `peerId` value that was previously generated on another device or from another source. That `peerId` is then used to establish a connection with another peer using the PeerJS library.

### <a name="d2d-beta"></a> Why is this beta?

Our initial testing hasn't discovered any obvious cases in which D2D would fail. We are confident that it works as expected on most Wi-Fi networks people use at home or in office environments that don't have tighter than average security policies. However, due to underlying tech used to facilitate P2P communication (WebRTC, STUN), we suspect there may be cases, still uncovered by our tests, in which this feature may be blocked by firewall and thus fail to work.

In addition to this, we also need to test how communication with STUN server works if PeerJS server is deployed with different configuration than our recommendation. We believe a more thorough tests are in order so that we can provide better and faster support for different cloud setups.

In order to remove beta status from this feature, we plan to:
* test with various network settings to try to clearly identify cases in which STUN/WebRTC traffic may be blocked
* test various PeerJS implementations to be able to provide clear recommendations, better support and more flexibility

Our priority is to promote D2D to a regular feature as soon as possible.
