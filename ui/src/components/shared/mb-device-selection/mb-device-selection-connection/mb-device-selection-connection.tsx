/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core';

import D2DStore, { clearPeer, d2dTranslations } from '../../../../utils/d2d.service';
import { droppedIcon, lostIcon, connectedIcon, finishedIcon } from '../icons';

@Component({
  tag: 'mb-device-selection-connection',
  styleUrl: 'mb-device-selection-connection.scss',
  shadow: true,
})
export class MbDeviceSelectionConnection {

  @Prop() variant: string;

  @Event() close: EventEmitter<void>;

  private onStartOver() {
    clearPeer();
    D2DStore.set('modalVisible', true);
  }

  private handleClose(event) {
    event.stopPropagation();
    this.close.emit();
  }

  render() {
    const infoMap = {
      dropped: {
        description: d2dTranslations.state.keys['d2d-dropped-description'],
        icon: droppedIcon,
        action: d2dTranslations.state.keys['d2d-dropped-action'],
        onClick: this.onStartOver.bind(this),
      },
      lost: {
        description: d2dTranslations.state.keys['d2d-lost-description'],
        icon: lostIcon,
        action: d2dTranslations.state.keys['d2d-lost-action'],
        onClick: this.onStartOver.bind(this),
      },
      connected: {
        description: d2dTranslations.state.keys['d2d-connected-description'],
        icon: connectedIcon,
        action: d2dTranslations.state.keys['d2d-connected-action'],
        inverted: true,
        onClick: this.handleClose.bind(this),
      },
      progress: {
        description: d2dTranslations.state.keys['d2d-progress-description'],
        element: <div class="mb-connection-element"><mb-spinner size="large" /></div>,
        action: d2dTranslations.state.keys['d2d-progress-action'],
        inverted: true,
        onClick: this.handleClose.bind(this),
      },
      finished: {
        description: d2dTranslations.state.keys['d2d-finished-description'],
        icon: finishedIcon,
        action: d2dTranslations.state.keys['d2d-finished-action'],
        onClick: this.handleClose.bind(this),
      },
      cancelled: {
        description: d2dTranslations.state.keys['d2d-cancelled-description'],
        icon: lostIcon,
        action: d2dTranslations.state.keys['d2d-cancelled-action'],
        onClick: this.onStartOver.bind(this),
      },
    };

    const activeInfo = infoMap[this.variant];

    if (!activeInfo) {
      return null;
    }

    const { description, icon, element, inverted, action, onClick } = activeInfo;

    return (
      <Host>
        {element ? element : <img class="mb-connection-icon" src={icon} />}
        <p class="description">{description}</p>
        <div class="button-wrapper">
          <mb-button-classic clickHandler={onClick} inverted={inverted}>{action}</mb-button-classic>
        </div>
      </Host>
    );
  }

}
