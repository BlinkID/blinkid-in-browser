/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import * as BlinkIDSDK from '../../../../../es/blinkid-sdk';

function getSDKWasmType(wasmType: string): BlinkIDSDK.WasmType | null {
  switch (wasmType) {
    case 'BASIC':
      return BlinkIDSDK.WasmType.Basic;
    case 'ADVANCED':
      return BlinkIDSDK.WasmType.Advanced;
    case 'ADVANCED_WITH_THREADS':
      return BlinkIDSDK.WasmType.AdvancedWithThreads;
    default:
      return null;
  }
}

export { getSDKWasmType }
