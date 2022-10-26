/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { newE2EPage } from '@stencil/core/testing';

describe('mb-api-process-status', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-api-process-status></mb-api-process-status>');

    const element = await page.find('mb-api-process-status');
    expect(element).toHaveClass('hydrated');
  });
});
