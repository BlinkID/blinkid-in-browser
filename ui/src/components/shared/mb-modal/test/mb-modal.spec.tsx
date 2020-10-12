import { newSpecPage } from '@stencil/core/testing';
import { MbModal } from '../mb-modal';

describe('mb-modal', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbModal],
      html: `<mb-modal></mb-modal>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-modal>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-modal>
    `);
  });
});
