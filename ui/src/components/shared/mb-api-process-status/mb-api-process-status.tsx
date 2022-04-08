/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import {
  Component,
  Element,
  Event,
  EventEmitter,
  Host,
  h,
  Prop
} from '@stencil/core';

import { TranslationService } from '../../../utils/translation.service';
import { setWebComponentParts, classNames } from '../../../utils/generic.helpers';

@Component({
  tag: 'mb-api-process-status',
  styleUrl: 'mb-api-process-status.scss',
  shadow: true,
})
export class MbApiProcessStatus {

  /**
   * Element visibility, default is 'false'.
   */
  @Prop() visible: boolean = false;

  /**
   * State value of API processing received from parent element ('loading' or 'success').
   */
  @Prop() state: 'ERROR' | 'LOADING' | 'NONE' | 'SUCCESS';

  /**
   * Instance of TranslationService passed from parent component.
   */
  @Prop() translationService: TranslationService;

  /**
   * Emitted when user clicks on 'Retry' button.
   */
  @Event() closeTryAgain: EventEmitter<void>;

  /**
   * Emitted when user clicks on 'x' button.
   */
  @Event() closeFromStart: EventEmitter<void>;

  /**
   * Host element as variable for manipulation
   */
  @Element() hostEl: HTMLElement;

  componentDidLoad() {
    setWebComponentParts(this.hostEl);
  }

  render() {
    return (
      <Host class={ classNames({ visible: this.visible }) }>

        { this.state === 'LOADING' &&
          <div class="reticle-container">
            <div class="reticle is-classification">
              <div class="reticle__cursor">
                <div class="reticle__el"></div>
                <div class="reticle__el"></div>
                <div class="reticle__el"></div>
                <div class="reticle__el"></div>
              </div>
            </div>

            <p class="message">{ this.translationService.i('process-api-message').toString() }</p>
          </div>
        }

        { this.state === 'SUCCESS' &&
          <div class="reticle-container">
            <div class="reticle is-done-all">
              <div class="reticle__cursor">
                <div class="reticle__el"></div>
                <div class="reticle__el"></div>
                <div class="reticle__el"></div>
                <div class="reticle__el"></div>
              </div>

              <img class="reticle__done" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwLjk3MiAzMy40NkMyMC43MDk1IDMzLjQ2MDUgMjAuNDQ5NCAzMy40MDkyIDIwLjIwNjggMzMuMzA5QzE5Ljk2NDEgMzMuMjA4OCAxOS43NDM2IDMzLjA2MTYgMTkuNTU4IDMyLjg3NkwxMS4wNzQgMjQuMzlDMTAuODgyOSAyNC4yMDU2IDEwLjczMDMgMjMuOTg1MSAxMC42MjU0IDIzLjc0MTFDMTAuNTIwNCAyMy40OTcyIDEwLjQ2NSAyMy4yMzQ4IDEwLjQ2MjUgMjIuOTY5MkMxMC40NiAyMi43MDM3IDEwLjUxMDQgMjIuNDQwMyAxMC42MTA4IDIyLjE5NDRDMTAuNzExMiAyMS45NDg2IDEwLjg1OTYgMjEuNzI1MiAxMS4wNDcyIDIxLjUzNzNDMTEuMjM0OSAyMS4zNDkzIDExLjQ1ODEgMjEuMjAwNyAxMS43MDM4IDIxLjA5OTlDMTEuOTQ5NSAyMC45OTkyIDEyLjIxMjggMjAuOTQ4NCAxMi40Nzg0IDIwLjk1MDVDMTIuNzQzOSAyMC45NTI2IDEzLjAwNjQgMjEuMDA3NiAxMy4yNTA1IDIxLjExMjNDMTMuNDk0NiAyMS4yMTY5IDEzLjcxNTQgMjEuMzY5MSAxMy45IDIxLjU2TDIwLjk3IDI4LjYzTDMzLjcgMTUuOTA0QzM0LjA3NSAxNS41Mjg3IDM0LjU4MzggMTUuMzE3OCAzNS4xMTQzIDE1LjMxNzZDMzUuNjQ0OCAxNS4zMTc0IDM2LjE1MzcgMTUuNTI4IDM2LjUyOSAxNS45MDNDMzYuOTA0MyAxNi4yNzggMzcuMTE1MiAxNi43ODY4IDM3LjExNTQgMTcuMzE3M0MzNy4xMTU2IDE3Ljg0NzggMzYuOTA1IDE4LjM1NjcgMzYuNTMgMTguNzMyTDIyLjM4NiAzMi44NzZDMjIuMjAwNCAzMy4wNjE2IDIxLjk3OTkgMzMuMjA4OCAyMS43MzcyIDMzLjMwOUMyMS40OTQ2IDMzLjQwOTIgMjEuMjM0NSAzMy40NjA1IDIwLjk3MiAzMy40NloiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=" />
            </div>
          </div>
        }

        { this.state === 'ERROR' &&
          <mb-modal
            visible={ true }
            modalTitle={ this.translationService.i('feedback-scan-unsuccessful-title').toString() }
            content={ this.translationService.i('feedback-scan-unsuccessful').toString() }
            onClose={ () => this.closeFromStart.emit() }
          >
            <div slot="actionButtons">
              <button
                class="primary modal-action-button"
                onClick={ () => this.closeTryAgain.emit() }
              >{ this.translationService.i('process-api-retry').toString() }</button>
            </div>
          </mb-modal>
        }

      </Host>
    );
  }
}
