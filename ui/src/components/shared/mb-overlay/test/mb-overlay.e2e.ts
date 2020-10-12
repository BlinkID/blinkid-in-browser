import { newE2EPage } from '@stencil/core/testing';

describe('mb-overlay', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-overlay></mb-overlay>');

    const element = await page.find('mb-overlay');
    expect(element).toHaveClass('hydrated');
  });
});
