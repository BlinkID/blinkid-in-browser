/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbScreen } from '../mb-screen';

describe('mb-screen', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbScreen],
      html: `<mb-screen></mb-screen>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-screen>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-screen>
    `);
  });
});
