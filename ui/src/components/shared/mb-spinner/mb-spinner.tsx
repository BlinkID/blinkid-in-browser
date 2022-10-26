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
  @Prop() icon: string = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA2IiBoZWlnaHQ9IjEwNiIgdmlld0JveD0iMCAwIDEwNiAxMDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUzIiBjeT0iNTMiIHI9IjUwIiBzdHJva2U9IiNEQ0VBRkYiIHN0cm9rZS13aWR0aD0iNiIvPgo8cGF0aCBkPSJNMyA1M0MzIDI1LjM4NTggMjUuMzg1OCAzIDUzIDMiIHN0cm9rZT0iIzAwNjJGMiIgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==';

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
