/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbDeviceSelectionConnection } from '../mb-device-selection-connection';

describe('mb-device-selection-connection', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbDeviceSelectionConnection],
      html: `<mb-device-selection-connection></mb-device-selection-connection>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-device-selection-connection>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-device-selection-connection>
    `);
  });
});
