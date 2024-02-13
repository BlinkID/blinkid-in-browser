/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import * as BlinkIDSDK from '../../../../../es/blinkid-sdk';

export function getSDKWasmType(wasmType: string): BlinkIDSDK.WasmType | null {
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

export function getSDKWasmFlavor(wasmFlavor: string): BlinkIDSDK.WasmFlavor | null {
  switch (wasmFlavor) {
    case 'Full':
      return BlinkIDSDK.WasmFlavor.Full;
    case 'Lightweight':
      return BlinkIDSDK.WasmFlavor.Lightweight;
    case 'LighweightWithFixedMemory':
      return BlinkIDSDK.WasmFlavor.LightweightWithFixedMemory;
    default:
      return null;
  }
}
