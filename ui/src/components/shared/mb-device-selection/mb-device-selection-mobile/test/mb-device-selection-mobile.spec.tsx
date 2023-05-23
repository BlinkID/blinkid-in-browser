/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbDeviceSelectionMobile } from '../mb-device-selection-mobile';

describe('mb-device-selection-mobile', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbDeviceSelectionMobile],
      html: `<mb-device-selection-mobile></mb-device-selection-mobile>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-device-selection-mobile>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-device-selection-mobile>
    `);
  });
});
