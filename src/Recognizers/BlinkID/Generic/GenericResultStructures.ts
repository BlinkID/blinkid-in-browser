/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { DocumentSide } from "../../../MicroblinkSDK/DocumentSide";
import { Rectangle } from "../../../MicroblinkSDK/Geometry";

/**
 * Smart date result structure.
 */
export interface DateResult
{
    readonly day?: number;
    readonly month?: number;
    readonly year?: number;
    readonly originalString?: StringResult;
    readonly successfullyParsed?: boolean;
    readonly filledByDomainKnowledge?: boolean;
    readonly empty?: boolean;
}

/**
 * Multi-script string result structure.
 */
export interface StringResult
{
    readonly arabic?: string;
    readonly cyrillic?: string;
    readonly latin?: string;
    readonly greek?: string;

    readonly arabicLocation: Rectangle | undefined;
    readonly cyrillicLocation: Rectangle | undefined;
    readonly latinLocation: Rectangle | undefined;
    readonly greekLocation: Rectangle | undefined;

    readonly arabicSide: DocumentSide | undefined;
    readonly cyrillicSide: DocumentSide | undefined;
    readonly latinSide: DocumentSide | undefined;
    readonly greekSide: DocumentSide | undefined;
}
