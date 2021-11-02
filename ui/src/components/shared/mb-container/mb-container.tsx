/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'mb-container',
  styleUrl: 'mb-container.scss',
  shadow: true,
})
export class MbContainer {

  render() {
    return (
      <Host part="mb-container">
        <slot></slot>
      </Host>
    );
  }

}
