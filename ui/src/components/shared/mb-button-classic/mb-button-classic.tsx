/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import {
  Component,
  Element,
  Host,
  h,
  Prop
} from '@stencil/core';

import { setWebComponentParts } from '../../../utils/generic.helpers';

@Component({
  tag: 'mb-button-classic',
  styleUrl: 'mb-button-classic.scss',
  shadow: true,
})
export class MbButtonClassic {

  /**
   * Set to 'true' if button should be inverted style.
   */
  @Prop() inverted: boolean = false;

  /**
   * Set to 'true' if button should be disabled, and if click events should not be triggered.
   */
  @Prop() disabled: boolean = false;

  /**
   * Set to 'true' if default event should be prevented.
   */
  @Prop() preventDefault: boolean = false;

  /**
   * Event which is triggered when user clicks on button element. This event is not triggered
   * when the button is disabled.
   */

  /** Function to call on click */
  @Prop() clickHandler!: (ev: UIEvent) => void;

  /**
   * Host element as variable for manipulation
   */
  @Element() hostEl: HTMLElement;

  connectedCallback() {
    setWebComponentParts(this.hostEl);
  }

  render() {
    return (
      <Host>
        <button disabled={this.disabled} onClick={this.clickHandler}>
          <slot></slot>
        </button>
      </Host>
    );
  }
}
