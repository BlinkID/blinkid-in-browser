/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from '@stencil/core/testing';

describe('mb-device-selection-intro', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-device-selection-intro></mb-device-selection-intro>');

    const element = await page.find('mb-device-selection-intro');
    expect(element).toHaveClass('hydrated');
  });
});
