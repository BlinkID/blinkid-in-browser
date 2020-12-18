/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbButton } from '../mb-button';

describe('mb-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbButton],
      html: `<mb-button></mb-button>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-button>
    `);
  });
});
