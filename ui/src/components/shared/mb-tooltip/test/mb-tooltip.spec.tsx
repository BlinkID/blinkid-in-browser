/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbTooltip } from '../mb-tooltip';

describe('mb-tooltip', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbTooltip],
      html: `<mb-tooltip></mb-tooltip>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-tooltip>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-tooltip>
    `);
  });
});
