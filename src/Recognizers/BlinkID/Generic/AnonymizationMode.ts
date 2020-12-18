/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * AnonymizationMode is used to define level of anonymization
 * performed on recognizer result.
 */
export enum AnonymizationMode
{
    /**
     * Anonymization will not be performed.
     */
    None = 0,

    /**
     * FullDocumentImage is anonymized with black boxes
     * covering sensitive data.
     */
    ImageOnly,

    /**
     * Result fields containing sensitive data are removed from result.
     */
    ResultFieldsOnly,

    /**
     * This mode is combination of ImageOnly and ResultFieldsOnly modes.
     */
    FullResult
}
