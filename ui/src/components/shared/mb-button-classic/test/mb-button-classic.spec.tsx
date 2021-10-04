/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbButtonClassic } from '../mb-button-classic';

describe('mb-button-classic', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbButtonClassic],
      html: `<mb-button-classic></mb-button-classic>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-button-classic>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-button-classic>
    `);
  });
});
