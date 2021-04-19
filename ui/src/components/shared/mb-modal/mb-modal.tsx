/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import {
  Component,
  Host,
  h,
  Prop,
  EventEmitter,
  Event
} from '@stencil/core';


@Component({
  tag: 'mb-modal',
  styleUrl: 'mb-modal.scss',
  shadow: true,
})
export class MbModal {

  /**
   * Show modal content
   */
  @Prop() visible: boolean = false;

  /**
   * Passed title content from parent component
   */
  @Prop() modalTitle: string = "";

  /**
   * Passed body content from parent component
   */
  @Prop() content: string = "";

  /**
   * Center content inside modal
   */
  @Prop() contentCentered: boolean = true;

  /**
   * Emitted when user clicks on 'X' button.
   */
  @Event() close: EventEmitter<void>;


  render() {
    return (
      <Host className={ this.getHostClassName() }>

        <div class="mb-modal">

          <div class="close-wrapper">
              <div class="close-icon" onClick={ () => this.close.emit() }>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.5896 4.4107C15.915 4.73614 15.915 5.26378 15.5896 5.58922L5.58958 15.5892C5.26414 15.9147 4.73651 15.9147 4.41107 15.5892C4.08563 15.2638 4.08563 14.7361 4.41107 14.4107L14.4111 4.4107C14.7365 4.08527 15.2641 4.08527 15.5896 4.4107Z" fill="#3C3C43" fill-opacity="0.5"/>
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M4.41107 4.4107C4.73651 4.08527 5.26414 4.08527 5.58958 4.4107L15.5896 14.4107C15.915 14.7361 15.915 15.2638 15.5896 15.5892C15.2641 15.9147 14.7365 15.9147 14.4111 15.5892L4.41107 5.58922C4.08563 5.26378 4.08563 4.73614 4.41107 4.4107Z" fill="#3C3C43" fill-opacity="0.5"/>
                </svg>
              </div>
          </div>

          <div class="title">{ this.modalTitle }</div>

          <div class={ this.getContentClassName() }>

            { this.content }

          </div>

          <div class="actions">

            <slot name="actionButtons"></slot>

          </div>

        </div>

      </Host>
    );
  }

  getHostClassName(): string {
    const classNames = [];

    if (this.visible) {
      classNames.push('visible');
    }

    return classNames.join(' ');
  }

  getContentClassName(): string {
    const classNames = ['content'];

    if (this.contentCentered) {
      classNames.push('centered');
    }

    return classNames.join(' ');
  }
}
