import { newE2EPage } from '@stencil/core/testing';

describe('mb-camera-experience', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mb-camera-experience></mb-camera-experience>');

    const element = await page.find('mb-camera-experience');
    expect(element).toHaveClass('hydrated');
  });
});
