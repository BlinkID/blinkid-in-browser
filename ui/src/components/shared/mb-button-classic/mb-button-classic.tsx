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

import { setWebComponentParts, classNames } from '../../../utils/generic.helpers';

@Component({
  tag: 'mb-button-classic',
  styleUrl: 'mb-button-classic.scss',
  shadow: true,
})
export class MbButtonClassic {

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
  @Event() buttonClick: EventEmitter<UIEvent>;

  /**
   * Host element as variable for manipulation
   */
  @Element() hostEl: HTMLElement;

  private handleClick(ev: UIEvent) {
    if (this.preventDefault) {
      ev.preventDefault();
    }

    if (this.disabled) {
      ev.stopPropagation();
      return;
    }

    this.buttonClick.emit(ev);
  }

  componentDidLoad() {
    setWebComponentParts(this.hostEl);
  }

  render() {
    return (
      <Host
        class={ classNames({ disabled: this.disabled }) }
        onClick={ (ev: UIEvent) => this.handleClick(ev) }>
        <a href="javascript:void(0)">
          <slot></slot>
        </a>
      </Host>
    );
  }
}
