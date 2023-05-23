/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from '@stencil/core/testing';

describe('mb-device-selection-handoff', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-device-selection-handoff></mb-device-selection-handoff>');

    const element = await page.find('mb-device-selection-handoff');
    expect(element).toHaveClass('hydrated');
  });
});
