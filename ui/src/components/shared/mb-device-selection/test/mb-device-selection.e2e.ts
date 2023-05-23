/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from '@stencil/core/testing';

describe('mb-device-selection', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-device-selection></mb-device-selection>');

    const element = await page.find('mb-device-selection');
    expect(element).toHaveClass('hydrated');
  });
});
