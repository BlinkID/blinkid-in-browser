/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import {
  Component,
  Element,
  Host,
  h,
  Prop,
} from '@stencil/core';

import { setWebComponentParts, classNames } from '../../../utils/generic.helpers';

@Component({
  tag: 'mb-button',
  styleUrl: 'mb-button.scss',
  shadow: true,
})
export class MbButton {

  /** Function to call on click */
  @Prop() clickHandler!: (ev: UIEvent) => void;

  /**
   * Set to 'true' if button should be disabled, and if click events should not be triggered.
   */
  @Prop() disabled: boolean = false;

  /**
   * Set to 'true' if button should be visible.
   */
  @Prop() visible: boolean = false;

  /**
   * Set to 'true' if button should enter 'selected' state.
   */
  @Prop() selected: boolean = false;

  /**
   * Passed image from parent component.
   */
  @Prop() imageSrcDefault!: string;

  /**
   * Passed image from parent component.
   */
  @Prop() imageSrcActive!: string;

  /**
   * Passed description text for image element from parent component.
   */
  @Prop() imageAlt: string = '';

  /**
   * Set to string which should be displayed below the icon.
   *
   * If omitted, nothing will show.
   */
  @Prop() label: string = '';

  @Prop() buttonTitle!: string;

  /**
   * Host element as variable for manipulation
   */
  @Element() hostEl: HTMLElement;

  connectedCallback() {
    setWebComponentParts(this.hostEl);
  }

  render() {
    return (
      <Host
        class={classNames({
          visible: this.visible,
          selected: this.selected,
        })}
      >
        <button onClick={this.clickHandler} title={this.buttonTitle} disabled={this.disabled}>
          <img class="icon-default" src={this.imageSrcDefault} alt="" />
          <img class="icon-active" src={this.imageSrcActive} alt="" />
        </button>
        {this.label !== "" && <span>{this.label}</span>}
      </Host>
    );
  }
}
