# BlinkID In-browser: usage with SuccessFrameGrabber

This example contains simple demo app which uses BlinkID In-browser SDK for scanning of identity documents.

## Usage

```
# Install dependencies
npm install

# Create file "dist/app.js"
npm run build

# Copy resources from NPM package
cp -r node_modules/@microblink/blinkid-in-browser-sdk/resources/* dist/

# Serve "dist" folder with any HTTP/S server
http-server dist/
```

### Notes

1. It's important to have `dist/resources` folder which contains all `BlinkIDWasmSDK*` files.
    * All files can be seen in `resources/` folder in the official GitHub repository and NPM package.
    * In `src/app.ts`, properties `loadSettings.engineLocation` and `loadSettings.workerLocation` must have value `"/resources"`.
2. Node v12 has been used while developing this example.
