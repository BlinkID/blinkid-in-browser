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

import { setWebComponentParts, classNames } from '../../../utils/generic.helpers';

@Component({
  tag: 'mb-screen',
  styleUrl: 'mb-screen.scss',
  shadow: true,
})
export class MbScreen {

  /**
   * Set to 'true' if screen should be visible.
   */
  @Prop() visible: boolean = false;

  /**
   * Host element as variable for manipulation
   */
  @Element() hostEl: HTMLElement;

  connectedCallback() {
    setWebComponentParts(this.hostEl);
  }

  render() {
    return (
      <Host className={ classNames({ visible: this.visible }) }>
        <slot></slot>
      </Host>
    );
  }
}
