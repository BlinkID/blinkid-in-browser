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
