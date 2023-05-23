/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import Peer from 'peerjs';
import { createStore } from '@stencil/store';

import { uuidv4 } from './generic.helpers';

export interface D2DOptions {
  port: number,
  host: string,
  secure: boolean,
  urlFactory: (peerId: string) => string,
  peerIdExtractor: () => string,
}

export class D2DSettings {
  port: D2DOptions['port'];

  host: D2DOptions['host'];

  secure: D2DOptions['secure'];

  urlFactory: D2DOptions['urlFactory'];

  peerIdExtractor: D2DOptions['peerIdExtractor'];


  constructor(options: D2DOptions) {
    if (!options.port) {
      throw new Error('Missing Port');
    }

    if (!options.host) {
      throw new Error('Missing Host');
    }

    if (!options.urlFactory) {
      throw new Error('Missing urlFactory');
    }

    if (!options.peerIdExtractor) {
      throw new Error('Missing peerIdExtractor');
    }

    this.port = options.port;
  
    this.host = options.host;
  
    this.secure = options.secure;
  
    this.urlFactory = options.urlFactory;
  
    this.peerIdExtractor = options.peerIdExtractor;
  }
}

export enum D2DScreens {
  initial = 'initial',
  handoff = 'handoff',
  dropped = 'dropped',
  progress = 'progress',
  lost = 'lost',
  connected = 'connected',
  finished = 'finished',
  cameraAccess = 'cameraAccess',
  invalidDevice = 'invalidDevice',
  expired = 'expired',
  cancelled = 'cancelled',
};

let peerConnection;

const handlePeerDisconnect = () => {
  if (peerConnection?.iceConnectionState === 'disconnected') {
    store.set('parentScreen', D2DScreens.lost);
    store.set('slaveScreen', D2DScreens.lost);
  }

  //Mozilla Firefox stuck on disconnected parent screen bugfix
  if (peerConnection?.iceConnectionState === 'connected') {
    store.set('parentScreen', D2DScreens.connected);
    store.set('slaveScreen', D2DScreens.connected);
  }
  
}

const store = createStore({
  peerId: null,
  peer: null,
  connection: null,
  parentScreen: D2DScreens.initial,
  slaveScreen: D2DScreens.progress,
  lastParentScreen: D2DScreens.initial,
  lastSlaveScreen: D2DScreens.progress,
  url: null,
  modalVisible: false,
  isSlaveReady: false,
  translations: {},
});

store.onChange('connection', (connection) => {
  if (connection?.peerConnection) {
    peerConnection = connection.peerConnection;
    peerConnection.addEventListener('iceconnectionstatechange', handlePeerDisconnect);
  } else if (peerConnection) {
    peerConnection.removeEventListener('iceconnectionstatechange', handlePeerDisconnect);
    peerConnection = undefined;
  }
});

export default store;

export const d2dTranslations = createStore({
  keys: {}
});

export function generatePeerId() {
  return uuidv4();
}

export function setupPeer(options: D2DOptions) {
  const peerId = generatePeerId();
  const peer = new Peer(peerId, {
    secure: options.secure,
    host: options.host,
    port: options.port,
  });

  store.set('peerId', peerId);
  store.set('peer', peer);
}

export function clearPeer() {
  store.state.connection?.close();
  store.state.peer?.disconnect();
  store.reset();
}

export function setupD2DTranslations(translationService) {
  d2dTranslations.set('keys', {
    'd2d-intro-title': translationService.i('d2d-intro-title').toString(),
    'd2d-intro-step-one': translationService.i('d2d-intro-step-one').toString(),
    'd2d-intro-step-two': translationService.i('d2d-intro-step-two').toString(),
    'd2d-intro-step-three': translationService.i('d2d-intro-step-three').toString(),
    'd2d-intro-action-start': translationService.i('d2d-intro-action-start').toString(),
    
    'd2d-initial-title': translationService.i('d2d-initial-title').toString(),
    'd2d-initial-description-part-one': translationService.i('d2d-initial-description-part-one').toString(),
    'd2d-initial-description-part-two': translationService.i('d2d-initial-description-part-two').toString(),
    
    'd2d-handoff-message-qr-link': translationService.i('d2d-handoff-message-qr-link').toString(),
    'd2d-handoff-title': translationService.i('d2d-handoff-title').toString(),
    'd2d-handoff-description-part-one': translationService.i('d2d-handoff-description-part-one').toString(),
    'd2d-handoff-description-part-two': translationService.i('d2d-handoff-description-part-two').toString(),
    
    'd2d-dropped-title': translationService.i('d2d-dropped-title').toString(),
    'd2d-dropped-description': translationService.i('d2d-dropped-description').toString(),
    'd2d-dropped-action': translationService.i('d2d-dropped-action').toString(),
    'd2d-dropped-mobile-title': translationService.i('d2d-dropped-mobile-title').toString(),
    'd2d-dropped-mobile-description': translationService.i('d2d-dropped-mobile-description').toString(),
    
    'd2d-progress-title': translationService.i('d2d-progress-title').toString(),
    'd2d-progress-description': translationService.i('d2d-progress-description').toString(),
    'd2d-progress-action': translationService.i('d2d-progress-action').toString(),
    'd2d-progress-footer': translationService.i('d2d-progress-footer').toString(),
    'd2d-progress-mobile-title': translationService.i('d2d-progress-mobile-title').toString(),
    'd2d-progress-mobile-description': translationService.i('d2d-progress-mobile-description').toString(),
    
    'd2d-lost-title': translationService.i('d2d-lost-title').toString(),
    'd2d-lost-description': translationService.i('d2d-lost-description').toString(),
    'd2d-lost-action': translationService.i('d2d-lost-action').toString(),
    'd2d-lost-footer': translationService.i('d2d-lost-footer').toString(),
    'd2d-lost-mobile-title': translationService.i('d2d-lost-mobile-title').toString(),
    'd2d-lost-mobile-description': translationService.i('d2d-lost-mobile-description').toString(),
    
    'd2d-cancelled-title': translationService.i('d2d-cancelled-title').toString(),
    'd2d-cancelled-description': translationService.i('d2d-cancelled-description').toString(),
    'd2d-cancelled-action': translationService.i('d2d-cancelled-action').toString(),
    'd2d-cancelled-footer': translationService.i('d2d-cancelled-footer').toString(),
    'd2d-cancelled-mobile-title': translationService.i('d2d-cancelled-mobile-title').toString(),
    'd2d-cancelled-mobile-description': translationService.i('d2d-cancelled-mobile-description').toString(),
    
    'd2d-connected-title': translationService.i('d2d-connected-title').toString(),
    'd2d-connected-description': translationService.i('d2d-connected-description').toString(),
    'd2d-connected-action': translationService.i('d2d-connected-action').toString(),
    'd2d-connected-footer': translationService.i('d2d-connected-footer').toString(),
    'd2d-connected-mobile-title': translationService.i('d2d-connected-mobile-title').toString(),
    'd2d-connected-mobile-description': translationService.i('d2d-connected-mobile-description').toString(),
    'd2d-connected-mobile-action': translationService.i('d2d-connected-mobile-action').toString(),
    
    'd2d-finished-title': translationService.i('d2d-finished-title').toString(),
    'd2d-finished-description': translationService.i('d2d-finished-description').toString(),
    'd2d-finished-action': translationService.i('d2d-finished-action').toString(),
    'd2d-finished-footer': translationService.i('d2d-finished-footer').toString(),
    'd2d-finished-mobile-title': translationService.i('d2d-finished-mobile-title').toString(),
    'd2d-finished-mobile-description': translationService.i('d2d-finished-mobile-description').toString(),
    
    'd2d-camera-access-mobile-title': translationService.i('d2d-camera-access-mobile-title').toString(),
    'd2d-camera-access-mobile-description': translationService.i('d2d-camera-access-mobile-description').toString(),
    'd2d-camera-access-mobile-info': translationService.i('d2d-camera-access-mobile-info').toString(),
    
    'd2d-invalid-device-mobile-title': translationService.i('d2d-invalid-device-mobile-title').toString(),
    'd2d-invalid-device-mobile-description': translationService.i('d2d-invalid-device-mobile-description').toString(),
    
    'd2d-expired-mobile-title': translationService.i('d2d-expired-mobile-title').toString(),
    'd2d-expired-mobile-description': translationService.i('d2d-expired-mobile-description').toString(),
    
    'd2d-quit-modal-title': translationService.i('d2d-quit-modal-title').toString(),
    'd2d-quit-modal-action-confirm': translationService.i('d2d-quit-modal-action-confirm').toString(),
    'd2d-quit-modal-action-deny': translationService.i('d2d-quit-modal-action-deny').toString(),
    
    'd2d-quit-modal-mobile-title': translationService.i('d2d-quit-modal-mobile-title').toString(),
    'd2d-quit-modal-mobile-action-confirm': translationService.i('d2d-quit-modal-mobile-action-confirm').toString(),
    'd2d-quit-modal-mobile-action-deny': translationService.i('d2d-quit-modal-mobile-action-deny').toString(),
    
    'd2d-close-window-modal-title': translationService.i('d2d-close-window-modal-title').toString(),
    'd2d-close-window-modal-title-progress': translationService.i('d2d-close-window-modal-title-progress').toString(),
    'd2d-close-window-modal-action-confirm': translationService.i('d2d-close-window-modal-action-confirm').toString(),
    'd2d-close-window-modal-action-deny': translationService.i('d2d-close-window-modal-action-deny').toString(),
    
    'd2d-mobile-label-cancel': translationService.i('d2d-mobile-label-cancel').toString(),
  });
};
