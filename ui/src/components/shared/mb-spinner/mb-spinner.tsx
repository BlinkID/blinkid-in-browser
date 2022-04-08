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
  tag: 'mb-spinner',
  styleUrl: 'mb-spinner.scss',
  shadow: true,
})
export class MbSpinner {

  /**
   * Value of `src` attribute for <img> element.
   */
  @Prop() icon: string = 'data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle opacity="0.33" cx="12" cy="12" r="10" stroke="%2348B2E8" stroke-width="4"/><path d="M2 12C2 6.47715 6.47715 2 12 2" stroke="%2348B2E8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /**
   * Spinner size, can be 'default' or 'large'.
   */
  @Prop() size: string = 'default';

  /**
   * Host element as variable for manipulation
   */
  @Element() hostEl: HTMLElement;

  componentDidLoad() {
    setWebComponentParts(this.hostEl);
  }

  render() {
    return (
      <Host class={ this.size }>
        <img src={ this.icon } />
      </Host>
    );
  }
}
