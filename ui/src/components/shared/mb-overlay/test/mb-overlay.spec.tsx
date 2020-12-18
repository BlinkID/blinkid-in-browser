/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbOverlay } from '../mb-overlay';

describe('mb-overlay', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbOverlay],
      html: `<mb-overlay></mb-overlay>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-overlay>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-overlay>
    `);
  });
});
