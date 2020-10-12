import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'mb-screen',
  styleUrl: 'mb-screen.scss',
  shadow: true,
})
export class MbScreen {

  /**
   * Set to 'true' if screen should be visible.
   */
  @Prop() visible: boolean = false;

  render() {
    return (
      <Host className={ this.visible ? 'visible' : '' }>
        <slot></slot>
      </Host>
    );
  }

}
