/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbApiProcessStatus } from '../mb-api-process-status';

describe('mb-api-process-status', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbApiProcessStatus],
      html: `<mb-api-process-status></mb-api-process-status>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-api-process-status>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-api-process-status>
    `);
  });
});
