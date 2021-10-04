/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'mb-completed',
  styleUrl: 'mb-completed.scss',
  shadow: true,
})
export class MbCompleted {

  /**
   * Value of `src` attribute for <img> element.
   */
  @Prop() icon: string = 'data:image/svg+xml;utf8,<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M21.2071 6.29289C21.5976 6.68342 21.5976 7.31658 21.2071 7.70711L11.2071 17.7071C10.8166 18.0976 10.1834 18.0976 9.79289 17.7071L4.79289 12.7071C4.40237 12.3166 4.40237 11.6834 4.79289 11.2929C5.18342 10.9024 5.81658 10.9024 6.20711 11.2929L10.5 15.5858L19.7929 6.29289C20.1834 5.90237 20.8166 5.90237 21.2071 6.29289Z" fill="%2348B2E8"/></svg>';

  render() {
    return (
      <Host>
        <img src={ this.icon } />
      </Host>
    );
  }

}
