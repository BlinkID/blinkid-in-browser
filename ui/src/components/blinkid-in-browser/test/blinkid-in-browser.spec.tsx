/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { BlinkidInBrowser } from '../blinkid-in-browser';

describe('blinkid-in-browser', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [BlinkidInBrowser],
      html: `<blinkid-in-browser></blinkid-in-browser>`,
    });
    expect(page.root).toEqualHtml(`
      <blinkid-in-browser>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </blinkid-in-browser>
    `);
  });
});
