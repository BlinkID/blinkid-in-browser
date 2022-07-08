/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from '@stencil/core/testing';

describe('mb-tooltip', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-tooltip></mb-tooltip>');

    const element = await page.find('mb-tooltip');
    expect(element).toHaveClass('hydrated');
  });
});
