/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { WasmType } from "./WasmType";


export type BlinkIDVariant = "full" | "lightweight";


export type BlinkIDResource = {
    wasmType: WasmType;
    blinkIDVariant: BlinkIDVariant;
};
