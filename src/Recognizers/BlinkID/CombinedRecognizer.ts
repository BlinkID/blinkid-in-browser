/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { RecognizerResult } from "../../MicroblinkSDK/DataStructures";

/**
 * Result of the data matching algorithm for scanned parts/sides of the document.
 */
export enum DataMatchResult
{
    /** Data matching has not been performed. */
    NotPerformed,
    /** Data does not match. */
    Failed,
    /** Data match. */
    Success
}

export interface CombinedRecognizerResult extends RecognizerResult
{
    /**
     * The result of the data matching algorithm for scanned parts/sides of the document.
     * For example if date of expiry is scanned from the front and back side
     * of the document and values do not match, this method will return {@link DataMatchResult#Failed}.
     * Result will be {@link DataMatchResult#Success} only if scanned values for all fields that are
     * compared are the same. If data matching has not been performed, result will be
     * {@link DataMatchResult#NotPerformed}.
     */
    readonly dataMatch: DataMatchResult;

    /**
     * {@code true} if recognizer has finished scanning first side and is now scanning back side,
     * {@code false} if it's still scanning first side.
     */
    readonly scanningFirstSideDone: boolean;
}
