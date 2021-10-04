/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbCameraSelection } from '../mb-camera-selection';

describe('mb-camera-selection', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbCameraSelection],
      html: `<mb-camera-selection></mb-camera-selection>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-camera-selection>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-camera-selection>
    `);
  });
});
