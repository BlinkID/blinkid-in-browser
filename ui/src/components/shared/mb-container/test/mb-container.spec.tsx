import { newSpecPage } from '@stencil/core/testing';
import { MbContainer } from '../mb-container';

describe('mb-container', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MbContainer],
      html: `<mb-container></mb-container>`,
    });
    expect(page.root).toEqualHtml(`
      <mb-container>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mb-container>
    `);
  });
});
