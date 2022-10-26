/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */
import { newE2EPage } from '@stencil/core/testing';

describe('mb-camera-toolbar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-camera-toolbar></mb-camera-toolbar>');

    const element = await page.find('mb-camera-toolbar');
    expect(element).toHaveClass('hydrated');
  });
});
