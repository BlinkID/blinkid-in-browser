/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core';
import { isDesktop } from '../../../../utils/device.helpers';
import { classNames } from '../../../../utils/generic.helpers';

@Component({
  tag: 'mb-device-selection-quit',
  styleUrl: 'mb-device-selection-quit.scss',
  shadow: true,
})
export class MbDeviceSelectionQuit {
  @Prop() visible: boolean = false;

  @Event() confirm: EventEmitter<void>;

  @Event() cancel: EventEmitter<void>;

  @Prop() modalLabel: string = '';

  @Prop() confirmLabel: string = '';

  @Prop() denyLabel: string = '';

  @Prop() description: string;

  private onConfirm() {
    this.confirm.emit();
  }

  private onCancel(event) {
    event.stopPropagation();
    this.cancel.emit();
  }

  render() {
    return (
      <Host>
        <mb-overlay visible={this.visible}>
          <mb-modal
            onClose={this.onCancel.bind(this)}
            modalTitle={this.modalLabel}
            visible={this.visible}
            hideFooter
          >
            <div slot="content">
              <div class="description">
                {this.description}
              </div>
            </div>
            <div slot="actionButtons">
              <div class={ classNames( { "button-wrapper-mobile": !isDesktop(), "button-wrapper": isDesktop() } ) }>
                <mb-button-classic clickHandler={this.onConfirm.bind(this)} quit>{this.confirmLabel}</mb-button-classic>
                <mb-button-classic clickHandler={this.onCancel.bind(this)} inverted quit>{this.denyLabel}</mb-button-classic>
              </div>
            </div>
          </mb-modal>
        </mb-overlay>
      </Host>
    );
  }
};
