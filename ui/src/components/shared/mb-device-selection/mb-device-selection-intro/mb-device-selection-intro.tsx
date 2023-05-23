/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { Component, Host, h, Event, EventEmitter, Prop } from '@stencil/core';

import D2DStore, { D2DOptions, D2DScreens, setupPeer, d2dTranslations } from '../../../../utils/d2d.service';
import { RecognitionEvent } from '../../../../utils/data-structures';
import { linkIcon, phoneIcon, desktopIcon } from '../icons';

@Component({
  tag: 'mb-device-selection-intro',
  styleUrl: 'mb-device-selection-intro.scss',
  shadow: true,
})
export class MbDeviceSelectionIntro {
  @Prop() d2dOptions: D2DOptions;

  @Event() done: EventEmitter<RecognitionEvent>;

  private onClick() {
    D2DStore.set('parentScreen', D2DScreens.handoff);

    setupPeer(this.d2dOptions);

    const { peer } = D2DStore.state;

    peer.on('connection', (connection) => {
      D2DStore.set('parentScreen', D2DScreens.connected);
      D2DStore.set('connection', connection);

      connection.on('data', (data) => {
        try {
          const parsedResult = JSON.parse(data);
          this.done.emit(parsedResult);
        }
        catch (error) {
          D2DStore.set('parentScreen', D2DScreens.dropped);
        }
        D2DStore.set('parentScreen', D2DScreens.finished);
      });

      connection.on('close', () => {
        D2DStore.set('parentScreen', D2DScreens.lost);
      });

      connection.on('error', () => {
        D2DStore.set('parentScreen', D2DScreens.dropped);
      })
    });
  }

  render() {
    return (
      <Host>
        <p class="description">{d2dTranslations.state.keys['d2d-intro-title']}</p>
        <div class="flow-content">
          <div class="flow-line flow-line__left" />
          <div class="flow-line flow-line__right" />
          <div class="flow-item">
            <img src={linkIcon} />
            <div class="text-muted">{d2dTranslations.state.keys['d2d-intro-step-one']}</div>
          </div>
          <div class="flow-item margin">
            <img src={phoneIcon} />
            <div class="text-muted">{d2dTranslations.state.keys['d2d-intro-step-two']}</div>
          </div>
          <div class="flow-item">
            <img src={desktopIcon} />
            <div class="text-muted">{d2dTranslations.state.keys['d2d-intro-step-three']}</div>
          </div>
        </div>
        <div class="button-wrapper">
          <mb-button-classic clickHandler={this.onClick.bind(this)}>{d2dTranslations.state.keys['d2d-intro-action-start']}</mb-button-classic>
        </div>
      </Host>
    );
  }

}
