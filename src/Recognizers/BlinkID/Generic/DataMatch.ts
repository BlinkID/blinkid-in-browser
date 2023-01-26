/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * Result of the data matching algorithm for scanned parts/sides of the document.
 */
export enum DataMatchState
{
    /** Data matching has not been performed. */
    NotPerformed = 0,
    /** Data does not match. */
    Failed,
    /** Data match. */
    Success
}

/**
 * Type of field on which data match algorithm has been performed.
 */
export enum DataMatchFieldType
{
    DateOfBirth = 0,
    DateOfExpiry,
    DocumentNumber,
    Count
}

export interface DataMatchFieldState
{
    /** Type of field on which data match algorithm has been performed. */
    readonly fieldType: DataMatchFieldType;

    /** The state of the data match on the specified field. */
    readonly state: DataMatchState;
}

export interface DataMatchResult
{
    /** The state of the data match on the whole document. */
    readonly state: DataMatchState;

    /** The state of the data match on the specified field. */
    readonly states: Array< DataMatchFieldState >;
}
