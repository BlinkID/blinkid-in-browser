import { newE2EPage } from '@stencil/core/testing';

describe('mb-container', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-container></mb-container>');

    const element = await page.find('mb-container');
    expect(element).toHaveClass('hydrated');
  });
});
