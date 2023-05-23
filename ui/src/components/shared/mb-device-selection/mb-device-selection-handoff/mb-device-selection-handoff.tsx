/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import QRCode from 'qrcode';
import { Component, Host, h, Prop } from '@stencil/core';

import D2DStore, { D2DOptions, d2dTranslations } from '../../../../utils/d2d.service';

@Component({
  tag: 'mb-device-selection-handoff',
  styleUrl: 'mb-device-selection-handoff.scss',
  shadow: true,
})
export class MbDeviceSelectionHandoff {
  private canvasRef: HTMLCanvasElement;
  
  @Prop() urlFactory: D2DOptions['urlFactory'];

  componentDidRender() {
    if (!this.canvasRef) {
      return null;
    }

    const url = this.urlFactory(D2DStore.state.peerId);
    QRCode.toCanvas(this.canvasRef, url, { scale: 6 });
    D2DStore.set('url', url);
  }

  render() {
    return (
      <Host>
        <canvas ref={el => this.canvasRef = el as HTMLCanvasElement}></canvas>
        <p class="text-muted">{d2dTranslations.state.keys['d2d-handoff-message-qr-link']}</p>
      </Host>
    );
  }

}
