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
  Method,
  Prop
} from '@stencil/core';

import { setWebComponentParts, extractFilenameFromPath } from '../../../utils/generic.helpers';

@Component({
  tag: 'mb-image-box',
  styleUrl: 'mb-image-box.scss',
  shadow: true,
})
export class MbImageBox {

  private scanFromImageInput: HTMLInputElement;
  private ctaLabel: HTMLParagraphElement;
  private addIcon: SVGElement;
  private removeIcon: SVGElement;

  private hasImage: boolean = false;

  /**
   * Text which represents name of the image.
   */
  @Prop() boxTitle: string;

  /**
   * Text which should be displayed inside 'Add image' anchor element when file
   * is not selected.
   */
  @Prop() anchorText: string;

  /**
   * Event which is triggered when selected image file is changed.
   */
  @Event() imageChange: EventEmitter<FileList>;

  /**
   * Host element as variable for manipulation
   */
  @Element() hostEl: HTMLElement;

  componentDidLoad() {
    setWebComponentParts(this.hostEl);
  }

  componentDidRender() {
    this.ctaLabel.innerText = this.anchorText;
  }

  /**
   * Clear input image.
   */
  @Method()
  async clear() {
    this.onClearImage();
  }

  private onFromImageClicked(ev: UIEvent) {
    ev.preventDefault();
    ev.stopPropagation();

    if (this.hasImage) {
      this.onClearImage();
    }
    else {
      this.scanFromImageInput.click();
    }
  }

  private onImageChange(ev: UIEvent) {
    const target = ev.target as HTMLInputElement;

    if (target.files && target.files.length) {
      this.ctaLabel.innerText = extractFilenameFromPath(target.value);
      this.ctaLabel.classList.add('filename');
      this.addIcon.classList.remove('visible');
      this.removeIcon.classList.add('visible');
      this.hasImage = true;

      this.imageChange.emit(target.files);
    }
    else {
      this.onClearImage();
    }
  }

  private onClearImage() {
    this.ctaLabel.innerText = this.anchorText;
    this.ctaLabel.classList.remove('filename');
    this.addIcon.classList.add('visible');
    this.removeIcon.classList.remove('visible');
    this.hasImage = false;
    this.scanFromImageInput.value = "";

    this.imageChange.emit();
  }

  render() {
    return (
      <Host>
        <p class="label">{this.boxTitle}</p>
        <input
          id="scan-from-image-input"
          ref={ el => this.scanFromImageInput = el as HTMLInputElement }
          type="file"
          accept="image/*"
          onChange={ (ev: UIEvent) => this.onImageChange(ev) } />
        <button
          class="cta"
          onClick={ (ev: UIEvent) => this.onFromImageClicked(ev) }>
          <p
            class="cta-label"
            ref={ el => this.ctaLabel = el as HTMLParagraphElement }></p>
          <svg
            ref={ el => this.addIcon = el as SVGElement }
            class="visible"
            width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.8333 4.16666C10.8333 3.70642 10.4602 3.33333 9.99992 3.33333C9.53968 3.33333 9.16659 3.70642 9.16659 4.16666V9.16666H4.16659C3.70635 9.16666 3.33325 9.53976 3.33325 10C3.33325 10.4602 3.70635 10.8333 4.16659 10.8333H9.16659V15.8333C9.16659 16.2936 9.53968 16.6667 9.99992 16.6667C10.4602 16.6667 10.8333 16.2936 10.8333 15.8333V10.8333H15.8333C16.2935 10.8333 16.6666 10.4602 16.6666 10C16.6666 9.53976 16.2935 9.16666 15.8333 9.16666H10.8333V4.16666Z" fill="#48B2E8"/>
          </svg>
          <svg
            ref={ el => this.removeIcon = el as SVGElement }
            width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M16.0893 5.58928C16.4147 5.26384 16.4147 4.7362 16.0893 4.41076C15.7638 4.08533 15.2362 4.08533 14.9108 4.41076L10.5 8.82151L6.08928 4.41076C5.76384 4.08533 5.2362 4.08533 4.91076 4.41076C4.58533 4.7362 4.58533 5.26384 4.91076 5.58928L9.32151 10L4.91076 14.4108C4.58533 14.7362 4.58533 15.2638 4.91076 15.5893C5.2362 15.9147 5.76384 15.9147 6.08928 15.5893L10.5 11.1785L14.9108 15.5893C15.2362 15.9147 15.7638 15.9147 16.0893 15.5893C16.4147 15.2638 16.4147 14.7362 16.0893 14.4108L11.6785 10L16.0893 5.58928Z" fill="#48B2E8"/>
          </svg>
        </button>
      </Host>
    );
  }
}
