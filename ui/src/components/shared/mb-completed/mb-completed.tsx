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
  tag: 'mb-completed',
  styleUrl: 'mb-completed.scss',
  shadow: true,
})
export class MbCompleted {

  /**
   * Value of `src` attribute for <img> element.
   */
  @Prop() icon: string = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNSAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yMS4yMDcxIDYuMjkyODlDMjEuNTk3NiA2LjY4MzQyIDIxLjU5NzYgNy4zMTY1OCAyMS4yMDcxIDcuNzA3MTFMMTEuMjA3MSAxNy43MDcxQzEwLjgxNjYgMTguMDk3NiAxMC4xODM0IDE4LjA5NzYgOS43OTI4OSAxNy43MDcxTDQuNzkyODkgMTIuNzA3MUM0LjQwMjM3IDEyLjMxNjYgNC40MDIzNyAxMS42ODM0IDQuNzkyODkgMTEuMjkyOUM1LjE4MzQyIDEwLjkwMjQgNS44MTY1OCAxMC45MDI0IDYuMjA3MTEgMTEuMjkyOUwxMC41IDE1LjU4NThMMTkuNzkyOSA2LjI5Mjg5QzIwLjE4MzQgNS45MDIzNyAyMC44MTY2IDUuOTAyMzcgMjEuMjA3MSA2LjI5Mjg5WiIgZmlsbD0iIzAwNjJGMiIvPgo8L3N2Zz4K';

  /**
   * Host element as variable for manipulation
   */
  @Element() hostEl: HTMLElement;

  componentDidLoad() {
    setWebComponentParts(this.hostEl);
  }

  render() {
    return (
      <Host>
        <img src={ this.icon } />
      </Host>
    );
  }
}
