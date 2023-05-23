/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newSpecPage } from '@stencil/core/testing';
import { MbDeviceSelectionIntro } from '../mb-device-selection-intro';

describe('mb-device-selection-intro', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbDeviceSelectionIntro],
      html: `<mb-device-selection-intro></mb-device-selection-intro>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-device-selection-intro>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-device-selection-intro>
    `);
  });
});
