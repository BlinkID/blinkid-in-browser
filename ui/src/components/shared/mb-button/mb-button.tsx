/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import {
  Component,
  Event,
  EventEmitter,
  Host,
  h,
  Prop
} from '@stencil/core';

import { TranslationService } from '../../../utils/translation.service';

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

  /**
   * Event which is triggered when user clicks on button element. This event is not triggered
   * when the button is disabled.
   */
  @Event() buttonClick: EventEmitter<UIEvent>;

  render() {
    return (
      <Host className={ this.getClassNames() } onClick={ (ev: UIEvent) => this.handleClick(ev) } ref={el => this.buttonElement = el as HTMLDivElement}>
        <a ref={el => this.anchorElement = el as HTMLAnchorElement} href="javascript:void(0)">
          {
            this.imageSrcDefault && this.imageAlt === 'action-alt-camera' &&
            <img src={ this.imageSrcDefault } alt={ this.translationService.i(this.imageAlt).toString() } ref={ el => this.iconElem = el as HTMLOrSVGImageElement } />
          }

          {
            this.imageSrcDefault && this.imageAlt === 'action-alt-gallery' &&
            <label htmlFor="scan-from-image-input">
              <img src={ this.imageSrcDefault } alt={ this.translationService.i(this.imageAlt).toString() } ref={ el => this.iconElem = el as HTMLOrSVGImageElement } />
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

  componentDidRender() {
    this.iconElem.setAttribute('src', this.imageSrcDefault);
    
    this.anchorElement.addEventListener('mouseover', () => this.handleMouseOver());
    this.anchorElement.addEventListener('mouseout', () => this.handleMouseOut());
  }

  private getClassNames(): string {
    const classNames = [];

    if (this.disabled) {
      classNames.push('disabled');
    }

    if (this.icon) {
      classNames.push('icon');
    }

    if (this.visible) {
      classNames.push('visible');
    }

    return classNames.join(' ');
  }

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
    if (!this.buttonElement.classList.contains('disabled')) this.iconElem.setAttribute('src', this.imageSrcActive);
  }

  private handleMouseOut() {
    if (!this.buttonElement.classList.contains('disabled')) this.iconElem.setAttribute('src', this.imageSrcDefault);
  }

  private iconElem: HTMLOrSVGImageElement;
  private buttonElement: HTMLDivElement;
  private anchorElement: HTMLAnchorElement;
}
