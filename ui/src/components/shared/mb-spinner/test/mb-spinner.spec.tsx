import { newSpecPage } from '@stencil/core/testing';
import { MbSpinner } from '../mb-spinner';

describe('mb-spinner', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbSpinner],
      html: `<mb-spinner></mb-spinner>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-spinner>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-spinner>
    `);
  });
});
