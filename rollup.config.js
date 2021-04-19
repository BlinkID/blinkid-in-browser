import { readFileSync, writeFileSync } from 'fs'

import babel from '@rollup/plugin-babel'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

const bannerMsg = `/*! ****************************************************************************
Copyright (c) Microblink. All rights reserved.

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.
***************************************************************************** */`

const terserConfig = {
    compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
    }
}

function replaceWorker(workerFile) {
    return {
        name: 'replace-placeholder',
        writeBundle: (options, bundle) => {
            const outputFilePath = options.file
            const outputFileName = outputFilePath.split('/').pop()
            const incompleteCode = bundle[outputFileName].code

            const workerContent = readFileSync(workerFile, 'utf8')

            const completeCode = incompleteCode.replace('@PLACEHOLDER:worker', workerContent)

            writeFileSync(outputFilePath, completeCode)
        }
    }
}

const config = {
    worker: {
        input: 'src/worker.ts',
        output: {
            file: 'resources/BlinkIDWasmSDK.worker.min.js',
            format: 'iife'
        },
        plugins: [
            nodeResolve(),
            typescript({ tsconfigOverride: { compilerOptions: { declaration: false } } }),
            babel({ babelHelpers: 'bundled' }),
            terser(terserConfig)
        ]
    },
    cjs: {
        input: 'src/index.ts',
        output: {
            file: 'lib/blinkid-sdk.js',
            format: 'cjs',
            indent: false,
            banner: bannerMsg
        },
        plugins: [
            nodeResolve(),
            typescript({ useTsconfigDeclarationDir: true }),
            babel({ babelHelpers: 'bundled' }),
            replaceWorker('resources/BlinkIDWasmSDK.worker.min.js')
        ]
    },
    es: {
        input: 'src/index.ts',
        output: {
            file: 'es/blinkid-sdk.js',
            format: 'es',
            indent: false,
            sourcemap: true,
            banner: bannerMsg
        },
        plugins: [
            nodeResolve(),
            typescript({ tsconfigOverride: { compilerOptions: { declaration: false, sourceMap: true } } }),
            babel({ babelHelpers: 'bundled' }),
            replaceWorker('resources/BlinkIDWasmSDK.worker.min.js')
        ]
    },
    esModule: {
        input: 'src/index.ts',
        output: {
            file: 'es/blinkid-sdk.mjs',
            format: 'es',
            indent: false,
            banner: bannerMsg
        },
        plugins: [
            nodeResolve(),
            typescript({ tsconfigOverride: { compilerOptions: { declaration: false } } }),
            babel({ babelHelpers: 'bundled' }),
            terser(terserConfig),
            replaceWorker('resources/BlinkIDWasmSDK.worker.min.js')
        ]
    },
    umdDev: {
        input: 'src/index.ts',
        output: {
            file: 'dist/blinkid-sdk.js',
            format: 'umd',
            name: '${libName}SDK',
            indent: false,
            sourcemap: true,
            banner: bannerMsg
        },
        plugins: [
            nodeResolve(),
            typescript({ tsconfigOverride: { compilerOptions: { declaration: false, sourceMap: true } } }),
            babel({ babelHelpers: 'bundled' }),
            replaceWorker('resources/BlinkIDWasmSDK.worker.min.js')
        ]
    },
    umdProd: {
        input: 'src/index.ts',
        output: {
            file: 'dist/blinkid-sdk.min.js',
            format: 'umd',
            name: 'BlinkIDSDK',
            indent: false,
            banner: bannerMsg
        },
        plugins: [
            nodeResolve(),
            typescript({ tsconfigOverride: { compilerOptions: { declaration: false } } }),
            babel({ babelHelpers: 'bundled' }),
            terser(terserConfig),
            replaceWorker('resources/BlinkIDWasmSDK.worker.min.js')
        ]
    }
}

export default [
    config.worker,
    config.cjs,
    config.es,
    config.esModule,
    config.umdDev,
    config.umdProd
]
