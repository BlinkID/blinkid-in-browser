/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { Component, Host, h, Event, EventEmitter, State, Prop } from '@stencil/core';

import { allowCameraIcon, droppedIcon, lostIcon, finishedIcon, mobileFooterIcon, invalidDeviceIcon, expiredIcon, phoneConnectedIcon } from '../icons';

import D2DStore, { setupPeer, D2DScreens, clearPeer, D2DOptions, d2dTranslations } from '../../../../utils/d2d.service';
import { isDesktop } from '../../../../utils/device.helpers';

@Component({
  tag: 'mb-device-selection-mobile',
  styleUrl: 'mb-device-selection-mobile.scss',
  shadow: true,
})
export class MbDeviceSelectionMobile {
  @Prop() d2dOptions: D2DOptions;

  @Event() init: EventEmitter<void>;

  @State() showQuitModal: boolean = false;

  componentWillLoad() {
    const parentPeerId = this.d2dOptions.peerIdExtractor();

    if (parentPeerId && isDesktop()) {
      return D2DStore.set('slaveScreen', D2DScreens.invalidDevice);
    }

    setupPeer(this.d2dOptions);

    const { peer } = D2DStore.state;

    peer.on('error', (error) => {
      if (error.type === 'peer-unavailable') {
        D2DStore.set('slaveScreen', D2DScreens.expired);
      }
    });

    peer.on('open', () => {
      const connection = peer.connect(parentPeerId);

      connection.on('open', () => {
        D2DStore.set('connection', connection);
        D2DStore.set('slaveScreen', D2DScreens.connected);

        connection.on('close', () => {
          const currentScreen = D2DStore.get('slaveScreen');
          const isFinished = currentScreen === D2DScreens.finished;

          if (isFinished) {
            D2DStore.set('slaveScreen', D2DScreens.finished);
            return;
          }

          D2DStore.set('slaveScreen', D2DScreens.lost);
        });

        connection.on('error', () => {
          D2DStore.set('slaveScreen', D2DScreens.dropped);
        });
      });
    });
  }

  private async handleContinue() {
    try {
      if (!D2DStore.state.isSlaveReady) {
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: {
        facingMode: { 
          ideal: 'environment',
        },
      } });
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());

      this.init.emit();
    } catch (error) {
      D2DStore.set('slaveScreen', D2DScreens.cameraAccess);
    }
  }

  private triggerCloseModal() {
    this.showQuitModal = !this.showQuitModal;
  }

  private handleClose() {
    this.triggerCloseModal();
    clearPeer();
    
    D2DStore.set('isSlaveReady', true);
    D2DStore.set('slaveScreen', D2DScreens.cancelled);
  }

  render() {
    const infoMap = {
      dropped: {
        title: d2dTranslations.state.keys['d2d-dropped-mobile-title'],
        description: d2dTranslations.state.keys['d2d-dropped-mobile-description'],
        icon: droppedIcon,
      },
      cancelled: {
        title: d2dTranslations.state.keys['d2d-cancelled-mobile-title'],
        description: d2dTranslations.state.keys['d2d-cancelled-mobile-description'],
        icon: lostIcon,
      },
      lost: {
        title: d2dTranslations.state.keys['d2d-lost-mobile-title'],
        description: d2dTranslations.state.keys['d2d-lost-mobile-description'],
        icon: lostIcon,
      },
      connected: {
        title: d2dTranslations.state.keys['d2d-connected-mobile-title'],
        description: d2dTranslations.state.keys['d2d-connected-mobile-description'],
        icon: phoneConnectedIcon,
        action: d2dTranslations.state.keys['d2d-connected-mobile-action'],
        onClick: this.handleContinue.bind(this),
        onCancel: this.triggerCloseModal.bind(this),
      },
      progress: {
        title: d2dTranslations.state.keys['d2d-progress-mobile-title'],
        description: d2dTranslations.state.keys['d2d-progress-mobile-description'],
        element: <div class="mb-mobile-icon-centered"><mb-spinner size="large" /></div>,
      },
      finished: {
        title: d2dTranslations.state.keys['d2d-finished-mobile-title'],
        description: d2dTranslations.state.keys['d2d-finished-mobile-description'],
        icon: finishedIcon,
      },
      cameraAccess: {
        title: d2dTranslations.state.keys['d2d-camera-access-mobile-title'],
        description: d2dTranslations.state.keys['d2d-camera-access-mobile-description'],
        icon: allowCameraIcon,
        onCancel: this.triggerCloseModal.bind(this),
      },
      invalidDevice: {
        title: d2dTranslations.state.keys['d2d-invalid-device-mobile-title'],
        description: d2dTranslations.state.keys['d2d-invalid-device-mobile-description'],
        icon: invalidDeviceIcon,
      },
      expired: {
        title: d2dTranslations.state.keys['d2d-expired-mobile-title'],
        description: d2dTranslations.state.keys['d2d-expired-mobile-description'],
        icon: expiredIcon,
      },
    };

    const activeInfo = D2DStore.state.isSlaveReady ? infoMap[D2DStore.state.slaveScreen] : infoMap.progress;

    if (!activeInfo) {
      return null;
    }

    const { title, description, icon, element, action, inverted, onClick, onCancel } = activeInfo;

    return (
      <Host>
        <mb-device-selection-quit
          modalLabel={d2dTranslations.state.keys['d2d-quit-modal-mobile-title']}
          confirmLabel={d2dTranslations.state.keys['d2d-quit-modal-mobile-action-confirm']}
          denyLabel={d2dTranslations.state.keys['d2d-quit-modal-mobile-action-deny']}
          onCancel={this.triggerCloseModal.bind(this)}
          onConfirm={this.handleClose.bind(this)}
          visible={this.showQuitModal}
        />
        <div class="content">
          <p class="title">{title}</p>
          {element ? element : <img class="mb-mobile-icon" src={icon} />}
          <p class="description">{description}</p>
          <div class="button-wrapper-mobile">
            {action ?
              <mb-button-classic disabled={!D2DStore.state.isSlaveReady} clickHandler={onClick} inverted={inverted}>{action}</mb-button-classic> 
            : null}
            {onCancel ? 
              <mb-button-classic clickHandler={onCancel} inverted>{d2dTranslations.state.keys['d2d-mobile-label-cancel']}</mb-button-classic>
            : null}
          </div>
        </div>
        <div class="footer">
          <img src={mobileFooterIcon} />
        </div>
      </Host>
    );
  }

}
