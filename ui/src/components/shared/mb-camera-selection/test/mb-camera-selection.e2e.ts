/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from '@stencil/core/testing';

describe('mb-camera-selection', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-camera-selection></mb-camera-selection>');

    const element = await page.find('mb-camera-selection');
    expect(element).toHaveClass('hydrated');
  });
});
