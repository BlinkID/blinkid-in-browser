/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbDeviceSelectionHandoff } from '../mb-device-selection-handoff';

describe('mb-device-selection-handoff', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbDeviceSelectionHandoff],
      html: `<mb-device-selection-handoff></mb-device-selection-handoff>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-device-selection-handoff>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-device-selection-handoff>
    `);
  });
});
