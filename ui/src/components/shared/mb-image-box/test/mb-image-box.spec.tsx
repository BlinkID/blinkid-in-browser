/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbImageBox } from '../mb-image-box';

describe('mb-image-box', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbImageBox],
      html: `<mb-image-box></mb-image-box>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-image-box>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-image-box>
    `);
  });
});
