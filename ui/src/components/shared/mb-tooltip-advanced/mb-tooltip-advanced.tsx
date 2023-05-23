/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'mb-tooltip-advanced',
  styleUrl: 'mb-tooltip-advanced.scss',
  shadow: true,
})
export class MbTooltipAdvanced {
  @Prop() show: boolean;
  @Prop() message: string;
  @Prop() arrowPosition?: 'arrow-left' | 'arrow-right'
    | 'arrow-up' | 'arrow-up-left' | 'arrow-up-right'
    | 'arrow-down' | 'arrow-down-left' | 'arrow-down-right'
  @Prop() textAlign?: 'text-center' | 'text-left' | 'text-right';

  render() {
    return (
      <Host>
        <p part="tooltip" class={`mb-tooltip ${ this.show ? "visible" : "" } ${ this.arrowPosition ? this.arrowPosition : "arrow-none" } ${ this.textAlign ? this.textAlign : "text-center" } `}>
          {this.message}
        </p>
      </Host>
    );
  }

}
