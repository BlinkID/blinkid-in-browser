import { 
  Component,
  Host,
  h,
  Prop,
  Event,
  EventEmitter,
} from '@stencil/core';

import { ModalContent } from '../../../utils/data-structures';


@Component({
  tag: 'mb-modal',
  styleUrl: 'mb-modal.scss',
  shadow: true,
})
export class MbModal {

  /**
   * Passed content from parent component
   */
  @Prop() content: ModalContent;

  /**
   * Emitted when user clicks on 'Close' button.
   */
  @Event() close: EventEmitter<void>;

  render() {
    return (
      <Host>

          <div class="mb-modal">

              <div class="title">{ this.content && this.content.title }</div>

              <div class="content centered">

                  { this.content && this.content.body }

              </div>

              <div class="actions">
                <button class="primary" onClick={() => this.close.emit()}>Close</button>
              </div>

          </div>

      </Host>
    );
  }

}
