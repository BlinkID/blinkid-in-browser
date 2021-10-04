/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from '@stencil/core/testing';

describe('mb-completed', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-completed></mb-completed>');

    const element = await page.find('mb-completed');
    expect(element).toHaveClass('hydrated');
  });
});
