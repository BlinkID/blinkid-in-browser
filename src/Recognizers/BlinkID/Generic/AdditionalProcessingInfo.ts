/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { FieldType } from "./FieldType";
import { ImageExtractionType } from "./ImageExtractionType";

/**
 * Detailed information about missing, invalid and extra fields.
 */
export interface AdditionalProcessingInfo
{
    /** List of fields that were expected on the document but were missing. */
    readonly missingMandatoryFields: Array< FieldType >;

    /** List of fields that contained characters which were not expected in that field. */
    readonly invalidCharacterFields: Array< FieldType >;

    /** List of fields that weren't expected on the document but were present. */
    readonly extraPresentFields: Array< FieldType >;

    readonly imageExtractionFailures: Array< ImageExtractionType >;
}
