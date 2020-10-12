import { newSpecPage } from '@stencil/core/testing';
import { MbFeedback } from '../mb-feedback';

describe('mb-feedback', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbFeedback],
      html: `<mb-feedback></mb-feedback>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-feedback>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-feedback>
    `);
  });
});
