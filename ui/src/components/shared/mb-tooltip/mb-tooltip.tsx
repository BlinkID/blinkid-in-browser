/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'mb-tooltip',
  styleUrl: 'mb-tooltip.scss',
  shadow: true,
})
export class MbTooltip {
  @Prop() show: boolean;

  @Prop() message: string;

  @Prop() arrowPosition?: 'arrow-left' | 'arrow-right' | 'arrow-up' | 'arrow-down' | 'arrow-none';

  @Prop() showWarningIcon?: boolean;

  @Prop() showInfoIcon?: boolean;

  @Prop() textAlign?: 'text-center' | 'text-left' | 'text-right';

  @Prop() containerWidth?: string;

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
