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

@Component({
  tag: 'mb-overlay',
  styleUrl: 'mb-overlay.scss',
  shadow: true,
})
export class MbOverlay {

  /**
   * Set to 'false' if overlay should not cover whole screen.
   */
  @Prop() fullscreen: boolean = true;

  /**
   * Set to 'true' if overlay should be visible.
   */
  @Prop() visible: boolean = false;

  /**
   * Host element as variable for manipulation (CSS in this case)
   */
  @Element() hostEl: HTMLElement;

  render() {
    return (
      <Host className={ this.getClassName() }>
        <slot></slot>
      </Host>
    );
  }

  getClassName(): string {
    const classNames = [];

    this.hostEl.classList.forEach((value) => {
      if (value !== 'visible' && value !== 'non-fullscreen') {
        classNames.push(value);
      }
    });

    if (this.visible) {
      classNames.push('visible');
    }

    if (!this.fullscreen) {
      classNames.push('non-fullscreen');
    }

    return classNames.join(' ');
  }
}
