Instructions for building and running this sample app
=====================================================

# Live version

You can check the live version of this sample app by clicking [this link](https://blinkid.github.io/blinkid-in-browser/demo/build/index.html).

# Building and running instructions

1. Install the SDK:

```
cd ..
npm install
cd -
```

2. Install all dependencies of the demo app:

```
npm install
```

3. Build the project

```
npm run build
```

4. Run the server that will serve the page. Note that on the first ever start of https server you may be asked for Administrator password, in order to generate a self-signed certificate.

```
npm start
```

5. Open [https://localhost](https://localhost) in your browser. Accept the risk of using self-signed certificate and the page will load.

### HTTPS note

In order to be able to use camera from browser, the page must be loaded from `https` origin. For more information, read about [privacy and security](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Privacy_and_security) on the Mozilla Developer Network.
