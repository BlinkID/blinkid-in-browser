/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from '@stencil/core/testing';

describe('mb-device-selection-connection', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-device-selection-connection></mb-device-selection-connection>');

    const element = await page.find('mb-device-selection-connection');
    expect(element).toHaveClass('hydrated');
  });
});
