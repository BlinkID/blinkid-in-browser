/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import {
  Component,
  Host,
  h,
  Prop
} from "@stencil/core";

@Component({
  tag: 'mb-progress-tracker',
  styleUrl: 'mb-progress-tracker.scss',
  shadow: true
})
export class MbProgressTracker {
  /**
   * Steps count.
   * 
   * Default is 3.
   */
  @Prop() size: number = 3;
  /**
   * Current step.
   * 
   * Steps start from 1 up to the size number.
   * 
   * Default is 1.
   */
  @Prop() current: number = 1;

  render() {
    const currentCorrected = this.getCurrentCorrected();
    const steps = this.getSteps();
    return (
      <Host>
        <div class="mb-progress-tracker">
          { steps.map(step => (
            <div class={ `dot ${currentCorrected === step ? 'active' : 'inactive' }` }></div>
          )) }
        </div>
      </Host>
    );
  }

  private getCurrentCorrected = (): number => {
    if (this.current < 1) {
      return 1;
    }
    if (this.current > this.size) {
      return this.size;
    }
    return this.current;
  };

  private getSteps = (): number[] => {
    const array: number[] = [];
    for (let counter = 1; counter <= this.size; counter++) {
      array.push(counter);
    }
    return array;
  };
}
