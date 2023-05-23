/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { Component, Host, h, Event, EventEmitter, State, Prop, Method } from '@stencil/core';

import D2DStore, { clearPeer, D2DOptions, D2DScreens, d2dTranslations } from '../../../utils/d2d.service';
import { RecognitionEvent } from '../../../utils/data-structures';
import { classNames } from '../../../utils/generic.helpers';
import { footerIcon } from './icons';

const COPY_COOLDOWN_MS = 1000;

@Component({
  tag: 'mb-device-selection',
  styleUrl: 'mb-device-selection.scss',
  shadow: true,
})
export class MbDeviceSelection {
  @Prop() d2dOptions: D2DOptions;
  /**
   * Close event
   */
  @Event() close: EventEmitter<void>;

  @Event() done: EventEmitter<RecognitionEvent>;

  @Event() init: EventEmitter<void>;

  @State() copyCooldown: boolean = false;

  @State() showQuitModal: boolean = false;

  @State() showCloseModal: boolean = false;

  private triggerQuitModal(event?: Event) {
    event?.stopPropagation();
    this.showQuitModal = !this.showQuitModal;
  }

  @Method()
  async closeModal() {
    this.showCloseModal = !this.showCloseModal;
  }

  private triggerCloseModal(event?: Event) {
    event?.stopPropagation();
    this.showCloseModal = !this.showCloseModal;
  }

  private handleClose(event?: Event) {
    event?.stopPropagation();
    this.showQuitModal = false;
    this.showCloseModal = false;
    clearPeer();
    this.close.emit();
  }

  private handleBack() {
    clearPeer();
    this.triggerQuitModal();
    D2DStore.set('parentScreen', D2DScreens.cancelled);
    D2DStore.set('modalVisible', true);
  }

  private copyUrl() {
    if (this.copyCooldown) {
      return;
    }

    this.copyCooldown = true;
    const textToWrite = D2DStore.get('url');
    navigator.clipboard.writeText(textToWrite);

    setTimeout(() => {
      this.copyCooldown = false
    }, COPY_COOLDOWN_MS);
  }

  private resetScreen() {
    D2DStore.set('parentScreen', D2DScreens.initial);
  }

  private openGallery() {
    this.handleClose();
    this.init.emit();
  }

  render() {
    const screenMap = {
      initial: {
        title: d2dTranslations.state.keys['d2d-initial-title'],
        footer: <span>{d2dTranslations.state.keys['d2d-initial-description-part-one']} <span onClick={this.openGallery.bind(this)} class="footer__link">{d2dTranslations.state.keys['d2d-initial-description-part-two']}</span></span>,
        component: <mb-device-selection-intro d2dOptions={this.d2dOptions} onDone={(data) => this.done.emit(data.detail)} />,
      },
      handoff: {
        title: d2dTranslations.state.keys['d2d-handoff-title'],
        footer: (
          <div class="copy-content-wrapper">
            <mb-tooltip arrowPosition="arrow-down" show={this.copyCooldown} message="Copied to clipboard" />
            <span>{d2dTranslations.state.keys['d2d-handoff-description-part-one']}
              <span onClick={this.copyUrl.bind(this)} class={classNames({ 'footer__link': true, 'footer__link--muted': this.copyCooldown })}>
                &nbsp;{d2dTranslations.state.keys['d2d-handoff-description-part-two']}
              </span>
            </span>
          </div>
        ),
        component: <mb-device-selection-handoff urlFactory={this.d2dOptions.urlFactory} />,
        onBack: this.resetScreen.bind(this),
      },
      dropped: {
        title: d2dTranslations.state.keys['d2d-dropped-title'],
        component:<mb-device-selection-connection onClose={this.handleClose.bind(this)} variant="dropped" />,
      },
      progress: {
        title: d2dTranslations.state.keys['d2d-progress-title'],
        footer: d2dTranslations.state.keys['d2d-progress-footer'],
        component: <mb-device-selection-connection onClose={this.triggerQuitModal.bind(this)} variant="progress" />,
        onBack: this.triggerQuitModal.bind(this),
      },
      lost: {
        title: d2dTranslations.state.keys['d2d-lost-title'],
        footer: d2dTranslations.state.keys['d2d-lost-footer'],
        component: <mb-device-selection-connection onClose={this.handleClose.bind(this)} variant="lost" />,
      },
      cancelled: {
        title: d2dTranslations.state.keys['d2d-cancelled-title'],
        footer: d2dTranslations.state.keys['d2d-cancelled-footer'],
        component: <mb-device-selection-connection onClose={this.handleClose.bind(this)} variant="cancelled" />,
      },
      connected: {
        title: d2dTranslations.state.keys['d2d-connected-title'],
        footer: d2dTranslations.state.keys['d2d-connected-footer'],
        component: <mb-device-selection-connection onClose={this.triggerQuitModal.bind(this)} variant="connected" />,
        onBack: this.triggerQuitModal.bind(this),
      },
      finished: {
        title: d2dTranslations.state.keys['d2d-finished-title'],
        footer: d2dTranslations.state.keys['d2d-finished-footer'],
        component: <mb-device-selection-connection onClose={this.handleClose.bind(this)} variant="finished" />,
      },
    };

    const selectedScreen = screenMap[D2DStore.state.parentScreen];

    if (!selectedScreen) {
      return null;
    }

    const { title, component, footer, onBack } = selectedScreen;

    return (
      <Host>
        <mb-modal
          id="mb-modal-device-selection"
          visible={D2DStore.get('modalVisible')}
          elevated
          centered
          modalTitle={title}
          showBackButton={!!onBack}
          onClose={this.triggerCloseModal.bind(this)}
          onBack={onBack}
        >
          <div slot="content">
            <mb-device-selection-quit
              modalLabel={d2dTranslations.state.keys['d2d-quit-modal-title']}
              confirmLabel={d2dTranslations.state.keys['d2d-quit-modal-action-confirm']}
              denyLabel={d2dTranslations.state.keys['d2d-quit-modal-action-deny']}
              onConfirm={this.handleBack.bind(this)}
              onCancel={this.triggerQuitModal.bind(this)}
              visible={this.showQuitModal}
            />
            <mb-device-selection-quit
              description={`${D2DStore.get('connection')?.open ? d2dTranslations.state.keys['d2d-close-window-modal-title-progress'] : ''} ${d2dTranslations.state.keys['d2d-close-window-modal-title']}`}
              modalLabel="Close"
              confirmLabel={d2dTranslations.state.keys['d2d-close-window-modal-action-confirm']}
              denyLabel={d2dTranslations.state.keys['d2d-close-window-modal-action-deny']}
              onConfirm={this.handleClose.bind(this)}
              onCancel={this.triggerCloseModal.bind(this)}
              visible={this.showCloseModal}
            />
            <div class="inner-content">
              {component}
            </div>
          </div>
          <div slot="footer">
            <div class="footer">
              <span class="text-muted">{footer}</span>
              <img src={footerIcon} />
            </div>
          </div>
        </mb-modal>
      </Host>
    );
  }

}
