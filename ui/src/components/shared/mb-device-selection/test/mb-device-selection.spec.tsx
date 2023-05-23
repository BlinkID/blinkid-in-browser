/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbDeviceSelection } from '../mb-device-selection';

describe('mb-device-selection', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbDeviceSelection],
      html: `<mb-device-selection></mb-device-selection>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-device-selection>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-device-selection>
    `);
  });
});
