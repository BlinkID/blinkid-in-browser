# Examples

Provided examples should help you with integration of this SDK with your app.

1. Scan identity document from camera - `blinkid-camera`.
2. Scan identity document from file - `blinkid-file`.
3. Scan both sides of an identity document from camera - `combined`.
4. Scan barcode on identity document from camera - `idbarcode`.

Each example has two different versions, placed in folders `javascript` and `typescript`.

Deployment:

* When accessing examples via web browser always use `localhost` instead of `127.0.0.1`.
* Examples should be served via HTTPS.
    * We recommend usage of NPM package [https-localhost](https://www.npmjs.com/package/https-localhost) for simple local deployment.

## TypeScript Examples

To run TypeScript examples:

1. Install example dependencies and build an application:
    ```
    # Make sure you're in the 'examples/<example-name>/typescript' folder

    # Install dependencies
    npm install

    # Build an application in folder 'dist/'
    npm run build
    ```
2. Copy WASM and WebWorker resources which are loaded during runtime.
    * Copy folder `node_modules/@microblink/blinkid-in-browser-sdk/resources/` to folder `dist/`.
3. Serve `dist/` folder, e.g. `serve dist/`.

## JavaScript Examples

To run JavaScript examples:

1. Serve `javascript/` folder, e.g. `serve javascript/`.
    * WASM and WebWorker resources are already placed in the `javascript/` folder.
