const path = require( "path" );
const CopyPlugin = require( "copy-webpack-plugin" );

module.exports = {
    entry: "./src/app.ts",
    module:
    {
        rules: [
            {
                test: /\.tsx?$/,
                use: "babel-loader",
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                // Copy 'index.html' and 'style.css' to output directory
                { from: "public" },

                // Copy ̇WASM resources to output directory
                { from: "node_modules/@microblink/blinkid-in-browser-sdk/resources" }
            ]
        })
    ],
    resolve:
    {
        extensions: [ ".tsx", ".ts", ".js" ],
    },
    output:
    {
        filename: "app.js",
        path: path.resolve( __dirname, "dist" ),
    }
};
