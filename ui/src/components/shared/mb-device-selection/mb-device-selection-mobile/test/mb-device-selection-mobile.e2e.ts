/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from '@stencil/core/testing';

describe('mb-device-selection-mobile', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-device-selection-mobile></mb-device-selection-mobile>');

    const element = await page.find('mb-device-selection-mobile');
    expect(element).toHaveClass('hydrated');
  });
});
