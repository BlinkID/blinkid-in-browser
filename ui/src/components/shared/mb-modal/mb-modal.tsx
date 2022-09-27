/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  h,
  Prop
} from '@stencil/core';

import { getWebComponentParts, setWebComponentParts, classNames } from '../../../utils/generic.helpers';

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
   * Show shadow drop
   */
  @Prop() elevated: boolean = false;

  /**
   * Center component
   */
  @Prop() centered: boolean = false;

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
   * Whether to show back arrow or not
   */
  @Prop() showBackButton: boolean = false;

  /**
   * Whether to hide the footer or not
   */
  @Prop() hideFooter: boolean = false;

  /**
   * Emitted when user clicks on 'X' button.
   */
  @Event() close: EventEmitter<void>;

  /**
   * Emitted when user clicks on 'Back Arrow' button.
   */
  @Event() back: EventEmitter<void>;

  /**
   * Host element as variable for manipulation
   */
  @Element() hostEl: HTMLElement;

  componentDidLoad() {
    setWebComponentParts(this.hostEl);
    const parts = getWebComponentParts(this.hostEl.shadowRoot);
    this.hostEl.setAttribute('exportparts', parts.join(', '));
  }

  render() {
    return (
      <Host class={ classNames({ visible: this.visible, elevated: this.elevated, centered: this.centered }) }>

        <div class="mb-modal">
          <div part="mb-modal-inner" class="inner">
            <div class="close-wrapper">
                <div class="close-icon" onClick={ () => this.close.emit() }>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M15.5892 4.41058C15.9147 4.73602 15.9147 5.26366 15.5892 5.58909L5.58925 15.5891C5.26381 15.9145 4.73617 15.9145 4.41073 15.5891C4.0853 15.2637 4.0853 14.736 4.41073 14.4106L14.4107 4.41058C14.7362 4.08514 15.2638 4.08514 15.5892 4.41058Z" fill="#9CA3AF"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.41073 4.41058C4.73617 4.08514 5.26381 4.08514 5.58925 4.41058L15.5892 14.4106C15.9147 14.736 15.9147 15.2637 15.5892 15.5891C15.2638 15.9145 14.7362 15.9145 14.4107 15.5891L4.41073 5.58909C4.0853 5.26366 4.0853 4.73602 4.41073 4.41058Z" fill="#9CA3AF"/>
                  </svg>
                </div>
            </div>

            {this.showBackButton ? (
              <div class="back-wrapper">
                  <div onClick={ () => this.back.emit() }>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M9.75596 4.41058C10.0814 4.73602 10.0814 5.26366 9.75596 5.58909L6.17855 9.1665H15.8334C16.2936 9.1665 16.6667 9.5396 16.6667 9.99984C16.6667 10.4601 16.2936 10.8332 15.8334 10.8332H6.17855L9.75596 14.4106C10.0814 14.736 10.0814 15.2637 9.75596 15.5891C9.43053 15.9145 8.90289 15.9145 8.57745 15.5891L3.57745 10.5891C3.25201 10.2637 3.25201 9.73602 3.57745 9.41058L3.57799 9.41005L8.57745 4.41058C8.90289 4.08514 9.43053 4.08514 9.75596 4.41058Z" fill="#9CA3AF"/>
                    </svg>
                  </div>
              </div>
            ) : null}

            <div class="title">{ this.modalTitle }</div>
            <div class={ this.contentCentered ? 'centered' : '' }>{ this.content }</div>
            <slot name="content"></slot>

            <div class="actions">
              <slot name="actionButtons"></slot>
            </div>
          </div>
          {this.hideFooter ? null : (
            <div class="footer">
              <slot name="footer"></slot>
            </div>
          )}
        </div>

      </Host>
    );
  }
}
