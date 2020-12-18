/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from '@stencil/core/testing';

describe('mb-component', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-component></mb-component>');

    const element = await page.find('mb-component');
    expect(element).toHaveClass('hydrated');
  });
});
