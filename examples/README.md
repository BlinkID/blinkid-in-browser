# Examples

Provided examples should help you with integration of this SDK and your app.

Deployment:

* When accessing examples via web browser always use `localhost` instead of `127.0.0.1`.
* For some examples examples should be served via HTTPS.
    * We recommned usage of NPM package [https-localhost](https://www.npmjs.com/package/https-localhost) for simple local deployment.

## TypeScript

To run TypeScript example just enter the directory and run:

```
npm install
npm run build
```

Folder `dist/` is going to be created which should be served locally.

## ES Module

To run ES module, local SDK files should be produced. Go to root folder of the
SDK and run:

```
npm install
npm run build
```

To run ES module example just serve the root folder of your project, and access
the web application on `https://localhost/examples/es-module`.

Alternatively, copy the ES bundle and files from `resources/` folder to `examples/es-module`
and change the value of `import` statement in `examples/es-module/main.js` file.

Also, don't forget to change values of `loadSettings.engineLocation` and
`loadSettings.workerLocation` to appropriate values.

## UMD Bundle

To run UMD bundle, local SDK files should be produced. Go to root folder of the
SDK and run:

```
npm install
npm run build
```

To run UMD example just serve the root folder of your project, and access the
web application on `https://localhost/examples/umd`.

Alternatively, copy the UMD bundle and files from `resources/` folder to `examples/umd`
and change the value of `src` attribute in `<script>` element in `examples/umd/index.html` file.

Also, don't forget to change values of `loadSettings.engineLocation` and
`loadSettings.workerLocation` to appropriate values.
