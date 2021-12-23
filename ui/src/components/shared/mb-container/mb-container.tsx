/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import {
  Component,
  Element,
  Host,
  h
} from '@stencil/core';

import { setWebComponentParts } from '../../../utils/generic.helpers';

@Component({
  tag: 'mb-container',
  styleUrl: 'mb-container.scss',
  shadow: true,
})
export class MbContainer {

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
        <slot></slot>
      </Host>
    );
  }
}
