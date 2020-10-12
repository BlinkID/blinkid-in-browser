import { newE2EPage } from '@stencil/core/testing';

describe('mb-spinner', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-spinner></mb-spinner>');

    const element = await page.find('mb-spinner');
    expect(element).toHaveClass('hydrated');
  });
});
