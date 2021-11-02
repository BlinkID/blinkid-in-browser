/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { Component, Host, h, Prop } from '@stencil/core';
import { classNames } from '../../../utils/generic.helpers';

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

  render() {
    return (
      <Host part="mb-screen" className={ classNames({ visible: this.visible }) }>
        <slot></slot>
      </Host>
    );
  }

}
