/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from '@stencil/core/testing';

describe('mb-button-classic', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-button-classic></mb-button-classic>');

    const element = await page.find('mb-button-classic');
    expect(element).toHaveClass('hydrated');
  });
});
