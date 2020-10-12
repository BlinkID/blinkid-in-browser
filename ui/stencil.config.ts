import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'blinkid-in-browser',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader'
    },
    {
      type: 'docs-readme',
      dir: 'docs',
      strict: true
    }
  ],
  plugins: [
    sass({
      // Add path to global SCSS files which should be included in every stylesheet
      injectGlobalPaths: []
    })
  ]
};
