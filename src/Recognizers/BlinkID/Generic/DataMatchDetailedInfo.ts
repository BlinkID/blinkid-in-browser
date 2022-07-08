/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { DataMatchResult } from "../CombinedRecognizer";

export interface DataMatchDetailedInfo
{
    /** The result of data match on date of birth field. */
    readonly dateOfBirth: DataMatchResult;

    /** The result of data match on date of expiry field. */
    readonly dateOfExpiry: DataMatchResult;

    /** The result of data match on document number field. */
    readonly documentNumber: DataMatchResult;

    /** The result of data match on the whole document. */
    readonly dataMatchResult: DataMatchResult;
}
