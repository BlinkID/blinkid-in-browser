/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */
import { newSpecPage } from '@stencil/core/testing';
import { MbCameraToolbar } from '../mb-camera-toolbar';

describe('mb-camera-toolbar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbCameraToolbar],
      html: `<mb-camera-toolbar></mb-camera-toolbar>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-camera-toolbar>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-camera-toolbar>
    `);
  });
});
