import { newE2EPage } from '@stencil/core/testing';

describe('mb-modal', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-modal></mb-modal>');

    const element = await page.find('mb-modal');
    expect(element).toHaveClass('hydrated');
  });
});
