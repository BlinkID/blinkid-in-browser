/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

export const defaultTranslations: { [key: string]: string|Array<string> } = {
  /* Help Screens */
  'help-button-lobby-tooltip': 'Need help?',
  'help-button-back': 'Back',
  'help-button-next': 'Next',
  'help-button-done': 'Done',
  'help-button-start-scanning': 'Start Scanning',
  'help-doc-valid-title': 'Keep all the details visible',
  'help-doc-valid-description': 'Make sure you keep the document well lit. All document fields should be visible on the camera screen.',
  'help-doc-invalid-invisible-fields-title': 'Keep all the details visible',
  'help-doc-invalid-invisible-fields-description': 'Make sure you aren\'t covering parts of the document with a finger, including the bottom lines. Also, watch out for hologram reflections that go over the document fields.',
  'help-doc-invalid-harsh-light-title': 'Watch out for harsh light',
  'help-doc-invalid-harsh-light-description': 'Avoid direct harsh light because it reflects from the document and can make parts of the document unreadable. If you can\'t read data on the document, it won\'t be visible to the camera either.',
  'help-doc-invalid-to-much-motion-title': 'Keep still while scanning',
  'help-doc-invalid-to-much-motion-description': 'Try to keep the phone and document still while scanning. Moving either can blur the image and make data on the document unreadable.',

  'd2d-intro-title': 'This is how it works:',
  'd2d-intro-step-one': 'Send a link to your phone',
  'd2d-intro-step-two': 'Open link and scan',
  'd2d-intro-step-three': 'Return to this device',
  'd2d-intro-action-start': 'Start',
  
  'd2d-initial-title': 'Switch to your phone',
  'd2d-initial-description-part-one': "Don’t want to use your phone?", 
  'd2d-initial-description-part-two': 'Continue here', 
  
  'd2d-handoff-message-qr-link': 'Use your phone camera to get the link behind this QR code.',
  'd2d-handoff-title': 'Scan the QR code', 
  'd2d-handoff-description-part-one': "Don't feel like scanning the QR code?", 
  'd2d-handoff-description-part-two': 'Copy the link here', 
  
  'd2d-dropped-title': 'Something happened',
  'd2d-dropped-description': "We couldn't connect your devices.",
  'd2d-dropped-action': 'Start over',
  'd2d-dropped-mobile-title': 'Something happened',
  'd2d-dropped-mobile-description': "We couldn't connect your phone. Return to the previous device and try again.",
  
  'd2d-progress-title': 'Connecting to your phone',
  'd2d-progress-description': 'Loading...',
  'd2d-progress-action': 'Cancel',
  'd2d-progress-footer': "Don't close this window until you're done with using your phone.",
  'd2d-progress-mobile-title': 'Loading...',
  'd2d-progress-mobile-description': 'Please wait while we connect your devices.',
  
  'd2d-lost-title': 'Phone disconnected',
  'd2d-lost-description': "We couldn't connect to your phone. Try again.",
  'd2d-lost-action': 'Start over',
  'd2d-lost-footer': "Don't close this window until you're done with using your phone.",
  'd2d-lost-mobile-title': 'Phone disconnected',
  'd2d-lost-mobile-description': "We couldn't connect to your phone. Try again.",
  
  'd2d-cancelled-title': 'Cancelled',
  'd2d-cancelled-description': 'Click on the button below to try again.',
  'd2d-cancelled-action': 'Start over',
  'd2d-cancelled-footer': 'You can close the browser window on your phone.',
  'd2d-cancelled-mobile-title': 'Cancelled',
  'd2d-cancelled-mobile-description': "You've cancelled scanning.",
  
  'd2d-connected-title': 'Phone connected',
  'd2d-connected-description': 'Switch to your phone, complete the process and return to this screen.',
  'd2d-connected-action': 'Cancel',
  'd2d-connected-footer': "Don't close this window until you're done with using your phone.",
  'd2d-connected-mobile-title': 'Phone connected',
  'd2d-connected-mobile-description': "Now you can start using your phone's camera.",
  'd2d-connected-mobile-action': 'Start',
  
  'd2d-finished-title': "That's it!",
  'd2d-finished-description': "You've completed the process.",
  'd2d-finished-action': 'Done',
  'd2d-finished-footer': 'You can now close this window.',
  'd2d-finished-mobile-title': 'Done',
  'd2d-finished-mobile-description': 'Success! Now you can return to the other device.',

  'd2d-camera-access-mobile-title': 'Camera access',
  'd2d-camera-access-mobile-description': 'Give access to your camera to start scanning.',
  'd2d-camera-access-mobile-info': 'Camera access is blocked. Please enable the camera permission in the settings.',

  'd2d-invalid-device-mobile-title': 'Open the link on your phone',
  'd2d-invalid-device-mobile-description': 'This link works only on mobile devices.',

  'd2d-expired-mobile-title': 'The link expired',
  'd2d-expired-mobile-description': 'The link isn’t active anymore. You can close this window.',
  
  'd2d-quit-modal-title': 'Are you sure you want to quit?',
  'd2d-quit-modal-action-confirm': 'Yes',
  'd2d-quit-modal-action-deny': 'No, return',

  'd2d-quit-modal-mobile-title': 'Are you sure you want to quit?',
  'd2d-quit-modal-mobile-action-confirm': 'Yes',
  'd2d-quit-modal-mobile-action-deny': "Don't quit",

  'd2d-close-window-modal-title': 'Are you sure you want to close the window?',
  'd2d-close-window-modal-title-progress': 'The process is in progress.',
  'd2d-close-window-modal-action-confirm': 'Close window',
  'd2d-close-window-modal-action-deny': "Don't close",

  'd2d-mobile-label-cancel': 'Cancel',

  'action-alt-camera': 'Device camera',
  'action-alt-gallery': 'From gallery',
  'action-message': 'Scan or choose from gallery',
  'action-message-camera': 'Device camera',
  'action-message-camera-disabled': 'Camera disabled',
  'action-message-camera-not-allowed': 'Camera not allowed',
  'action-message-camera-in-use': 'Camera in use',
  'action-message-image': 'From gallery',
  'action-message-image-not-supported': 'Not supported',
  'camera-disabled': 'Camera disabled',
  'camera-not-allowed': 'Cannot access camera.',
  'camera-in-use': 'Camera is already used by another application.',
  'camera-generic-error': 'Cannot access camera.',
  'camera-feedback-scan-front': ['Scan the front side', 'of a document'],
  'camera-feedback-scan-back': ['Scan the back side', 'of a document'],
  'camera-feedback-flip': 'Flip to the back side',
  'camera-feedback-barcode-message': 'Scan the barcode',
  'camera-feedback-move-farther': 'Move farther',
  'camera-feedback-move-closer': 'Move closer',
  'camera-feedback-adjust-angle': 'Adjust the angle',
  'camera-feedback-barcode': ['Bring barcode closer', 'and keep it centered'],
  'drop-info': 'Drop image here',
  'drop-error': 'Whoops, we don\'t support that image format. Please upload a JPEG or PNG file.',
  'initialization-error': 'Failed to load component. Try using another device or update your browser.',
  'process-image-box-first': 'Front side image',
  'process-image-box-second': 'Back side image',
  'process-image-box-add': 'Add image',
  'process-image-upload-cta': 'Upload',
  'process-image-message': 'Just a moment.',
  'process-image-message-inline': 'Processing',
  'process-image-message-inline-done': 'Processing done',
  'process-api-message': 'Just a moment',
  'process-api-retry': 'Retry',
  'feedback-scan-unsuccessful-title': 'Scan unsuccessful',
  'feedback-scan-unsuccessful': 'We weren\'t able to recognize your document. Please try again.',
  'feedback-error-generic': 'Whoops, that didn\'t work. Please give it another go.',
  'check-internet-connection': 'Check internet connection.',
  'network-error': 'Network error.',
  'scanning-not-available': 'Scanning not available.',
  'modal-window-close': 'Close',
}

export class TranslationService {
  public translations: { [key: string]: string|Array<string> };

  constructor(alternativeTranslations?: { [key: string]: string|Array<string> }) {
    this.translations = defaultTranslations;

    for (const key in alternativeTranslations) {
      if (key in defaultTranslations) {
        if (this.isExpectedValue(alternativeTranslations[key])) {
          this.translations[key] = alternativeTranslations[key];
        }
      }
    }
  }

  public i(key: string): string|Array<string> {
    if (this.translations[key]) {
      if (Array.isArray(this.translations[key])) {
        return JSON.parse(JSON.stringify(this.translations[key]));
      }
      return this.translations[key];
    }
  }

  private isExpectedValue(value: string | Array<string>): boolean {
    if (Array.isArray(value)) {
      const notValidFound = value.filter(item => typeof item !== 'string');
      return notValidFound.length == 0;
    }
    return typeof value === 'string';
  }
}
