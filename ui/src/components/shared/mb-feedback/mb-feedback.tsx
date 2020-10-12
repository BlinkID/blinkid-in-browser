import { Component, Host, h, Method, Prop } from '@stencil/core';

import {
  FeedbackMessage,
  FeedbackState
} from '../../../utils/data-structures';


@Component({
  tag: 'mb-feedback',
  styleUrl: 'mb-feedback.scss',
  shadow: true,
})
export class MbFeedback {

  /**
   * Set to 'true' if component should be visible.
   */
  @Prop() visible: boolean = false;

  /**
   * Call when FeedbackMessage which should be displayed.
   */
  @Method()
  async show(feedback: FeedbackMessage) {
    this.paragraphEl.innerText = feedback.message;
    this.paragraphEl.className = this.getFeedbackClassName(feedback.state);
  }

  render() {
    return (
      <Host className={ this.visible ? 'visible' : '' }>
        <p ref={ el => this.paragraphEl = el as HTMLParagraphElement }></p>
      </Host>
    );
  }

  private paragraphEl!: HTMLParagraphElement;

  private getFeedbackClassName(state: FeedbackState): string {
    switch (state) {
      case FeedbackState.Error:
        return 'error';

      case FeedbackState.Info:
        return 'info';

      default:
        return '';
    }
  }
}
