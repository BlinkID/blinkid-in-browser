/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from '@stencil/core/testing';

describe('mb-image-box', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-image-box></mb-image-box>');

    const element = await page.find('mb-image-box');
    expect(element).toHaveClass('hydrated');
  });
});
