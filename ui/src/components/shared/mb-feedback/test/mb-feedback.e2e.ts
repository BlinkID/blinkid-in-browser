import { newE2EPage } from '@stencil/core/testing';

describe('mb-feedback', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-feedback></mb-feedback>');

    const element = await page.find('mb-feedback');
    expect(element).toHaveClass('hydrated');
  });
});
