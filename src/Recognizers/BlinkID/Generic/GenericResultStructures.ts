/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

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
}
