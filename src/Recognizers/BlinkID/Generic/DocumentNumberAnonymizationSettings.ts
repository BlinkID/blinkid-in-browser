/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

export interface DocumentNumberAnonymizationSettings {
    /**
     * Defines how many digits at the beginning of the document number remain visible after anonymization.
     */
    prefixDigitsVisible: number;

    /**
     * Defines how many digits at the end of the document number remain visible after anonymization.
     */
    suffixDigitsVisible: number;
}
