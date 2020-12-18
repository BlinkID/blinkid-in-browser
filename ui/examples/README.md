# Examples

Provided examples should help you with integration of this SDK with your app.

Deployment:

* When accessing examples via web browser always use `localhost` instead of `127.0.0.1`.
* Examples should be served via HTTPS.
    * We recommend usage of NPM package [https-localhost](https://www.npmjs.com/package/https-localhost) for simple local deployment.

## TypeScript Example

To run TypeScript example:

1. Install example dependencies and build an application:
    ```
    # Make sure you're in the 'ui/examples/typescript' folder

    # Install dependencies
    npm install

    # Build an application in folder 'dist/'
    npm run build
    ```
2. Runtime resources are copied to `dist/` folder during build action, check `rollup.config.js` file.
3. Serve `dist/` folder, e.g. `serve dist/`.

## JavaScript Example

To run JavaScript examples:

1. Serve `javascript/` folder, e.g. `serve javascript/`.
    * Make sure to have internet connection since runtime resources are loaded from the CDN.
    * Alternatively, change resource paths and provide JS bundles.