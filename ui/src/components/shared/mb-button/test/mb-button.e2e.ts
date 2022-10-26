/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from '@stencil/core/testing';

describe('mb-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-button></mb-button>');

    const element = await page.find('mb-button');
    expect(element).toHaveClass('hydrated');
  });
});
