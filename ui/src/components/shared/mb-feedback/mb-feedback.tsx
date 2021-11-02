/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { Component, Host, h, Method, Prop, State } from '@stencil/core';

import {
  FeedbackMessage
} from '../../../utils/data-structures';
import { classNames } from '../../../utils/generic.helpers';

import * as Utils from './mb-feedback.utils';

@Component({
  tag: 'mb-feedback',
  styleUrl: 'mb-feedback.scss',
  shadow: true,
})
export class MbFeedback {
  @State() paragraphClassName: string;

  @State() paragraphValue: string;

  /**
   * Set to 'true' if component should be visible.
   */
  @Prop() visible: boolean = false;

  /**
   * Call when FeedbackMessage which should be displayed.
   */
  @Method()
  async show(feedback: FeedbackMessage) {
    this.paragraphValue = feedback.message;
    this.paragraphClassName = Utils.getFeedbackClassName(feedback.state);
  }

  render() {
    return (
      <Host part="mb-feedback" className={ classNames({ visible: this.visible }) }>
        <p class={ this.paragraphClassName }>{ this.paragraphValue }</p>
      </Host>
    );
  }
}
