/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbCompleted } from '../mb-completed';

describe('mb-completed', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbCompleted],
      html: `<mb-completed></mb-completed>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-completed>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-completed>
    `);
  });
});
