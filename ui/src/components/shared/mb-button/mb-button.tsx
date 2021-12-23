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
  Prop,
  State
} from '@stencil/core';

import { TranslationService } from '../../../utils/translation.service';
import { setWebComponentParts, classNames } from '../../../utils/generic.helpers';

@Component({
  tag: 'mb-button',
  styleUrl: 'mb-button.scss',
  shadow: true,
})
export class MbButton {

  /**
   * Set to 'true' if button should be disabled, and if click events should not be triggered.
   */
  @Prop() disabled: boolean = false;

  /**
   * Set to 'true' if button contains an icon.
   */
  @Prop() icon: boolean = false;

  /**
   * Set to 'true' if default event should be prevented.
   */
  @Prop() preventDefault: boolean = false;

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
  @Prop() imageSrcDefault: string = '';

  /**
   * Passed image from parent component.
   */
  @Prop() imageSrcActive: string = '';

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

  /**
   * Instance of TranslationService passed from root component.
   */
  @Prop() translationService: TranslationService;

  @State() imageSrc: string = this.imageSrcDefault;

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

  private handleMouseOver() {
    if (!this.disabled) {
      this.imageSrc = this.imageSrcActive;
    }
  }

  private handleMouseOut() {
    if (!this.disabled) {
      this.imageSrc = this.imageSrcDefault;
    }
  }

  connectedCallback() {
    setWebComponentParts(this.hostEl);
  }

  render() {
    return (
      <Host
        className={ classNames({ visible: this.visible, disabled: this.disabled, icon: this.icon, selected: this.selected }) }
        onClick={ (ev: UIEvent) => this.handleClick(ev) }>
        <a onMouseOver={ this.handleMouseOver.bind(this) } onMouseOut={ this.handleMouseOut.bind(this) } href="javascript:void(0)">
          {
            this.imageSrcDefault && this.imageAlt === 'action-alt-camera' &&
            <img src={ this.imageSrc } alt={ this.translationService.i(this.imageAlt).toString() } />
          }

          {
            this.imageSrcDefault && this.imageAlt === 'action-alt-gallery' &&
            <label htmlFor="scan-from-image-input">
              <img src={ this.imageSrc } alt={ this.translationService.i(this.imageAlt).toString() } />
            </label>
          }
        </a>
        {
          this.label !== '' &&
          <span>{ this.label }</span>
        }
      </Host>
    );
  }
}
