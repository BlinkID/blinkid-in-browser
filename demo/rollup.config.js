import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript3'
import { terser } from 'rollup-plugin-terser'
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy'

export default
[
    {
        input: 'src/index.ts',
        output:
        [
            {
                file: 'build/index.js',
                name: "index",
                format: 'iife',
                sourcemap: true
            }
        ],
        plugins:
        [
            // Compile TypeScript files
            typescript(
                {
                    compilerOptions: {
                        target: "es6",
                        module: "es6",
                        moduleResolution: "node",
                        declaration: true,
                        forceConsistentCasingInFileNames: true,
                        noImplicitReturns: true,
                        strict: true,
                        noUnusedLocals: true
                    }
                }
            ),
            resolve(),
            sourceMaps(),
            terser(
                {
                    ecma: 6
                }
            ),
            // copy HTML and pre-built files to build folder
            copy(
                {
                    targets: [
                        {
                            src: 'src/index.html',
                            dest: 'build'
                        },
                        {
                            src: 'node_modules/@microblink/blinkid-web/build/*',
                            dest: 'build'
                        }
                    ]
                }
            )
        ]
    }
]
