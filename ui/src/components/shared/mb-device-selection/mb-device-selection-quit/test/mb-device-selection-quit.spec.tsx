/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbDeviceSelectionQuit } from '../mb-device-selection-quit';

describe('mb-device-selection-quit', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbDeviceSelectionQuit],
      html: `<mb-device-selection-quit></mb-device-selection-quit>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-device-selection-quit>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-device-selection-quit>
    `);
  });
});
