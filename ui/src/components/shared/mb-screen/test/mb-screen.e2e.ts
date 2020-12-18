/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from '@stencil/core/testing';

describe('mb-screen', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-screen></mb-screen>');

    const element = await page.find('mb-screen');
    expect(element).toHaveClass('hydrated');
  });
});
