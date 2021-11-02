/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { CameraExperienceState } from '../../../utils/data-structures';

function getStateClass(state: CameraExperienceState): string {
  let stateClass = 'is-default';

  switch (state) {
    case CameraExperienceState.BarcodeScanning:
    case CameraExperienceState.Classification:
      stateClass = 'is-classification';
      break;

    case CameraExperienceState.Default:
      stateClass = 'is-default';
      break;

    case CameraExperienceState.Detection:
      stateClass = 'is-detection';
      break;

    case CameraExperienceState.MoveFarther:
      stateClass = 'is-error-move-farther';
      break;

    case CameraExperienceState.MoveCloser:
      stateClass = 'is-error-move-closer';
      break;

    case CameraExperienceState.AdjustAngle:
      stateClass = 'is-error-adjust-angle';
      break;

    case CameraExperienceState.Flip:
      stateClass = 'is-flip';
      break;

    case CameraExperienceState.Done:
      stateClass = 'is-done';
      break;

    case CameraExperienceState.DoneAll:
      stateClass = 'is-done-all';
      break;

    default:
      // Reset class
  }

  return stateClass;
}

export { getStateClass };
