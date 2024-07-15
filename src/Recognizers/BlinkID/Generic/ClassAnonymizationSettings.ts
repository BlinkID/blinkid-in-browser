/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 *
 */
import { ClassFilter } from "./ClassFilter";
import { DocumentNumberAnonymizationSettings } from "./DocumentNumberAnonymizationSettings";
import { FieldType } from "./FieldType";

export class ClassAnonymizationSettings
{
    classFilter: ClassFilter = new ClassFilter();

    /**
     * Fields to be anonymized.
     */
    fields: Array<FieldType> = new Array<FieldType>();

    /**
     * Anonymization settings for a document number.
     */
    documentNumberAnonymizationSettings: DocumentNumberAnonymizationSettings | null =
        null;
}
