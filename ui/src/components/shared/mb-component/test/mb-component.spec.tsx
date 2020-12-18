/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbComponent } from '../mb-component';

describe('mb-component', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbComponent],
      html: `<mb-component></mb-component>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-component>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-component>
    `);
  });
});
