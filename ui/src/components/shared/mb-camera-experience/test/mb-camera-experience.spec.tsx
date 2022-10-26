/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbCameraExperience } from '../mb-camera-experience';

describe('mb-camera-experience', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbCameraExperience],
      html: `<mb-camera-experience></mb-camera-experience>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-camera-experience>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-camera-experience>
    `);
  });
});
