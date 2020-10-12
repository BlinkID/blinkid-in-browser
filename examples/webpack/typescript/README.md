# BlinkID In-browser SDK: Webpack + TypeScript

This example contains simple demo app which uses BlinkID In-browser SDK for scanning of identity documents.

Environment: Webpack, Babel, TypeScript.

## Usage

```
# Install dependencies
npm install

# Create file "dist/app.js" - keep in mind that WASM resources are copied from node_modules during build action
npm run build

# Serve "dist" folder with any HTTP/S server
http-server dist/
```

### Notes

It's important to have WASM resources which can be found in `resources/` folder in the official GitHub repository and NPM package.
