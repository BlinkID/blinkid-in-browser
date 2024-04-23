/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 *
 */
import { DocumentType } from "./ClassInfo";
import { Country, Region } from "./ClassInfo";
import { DocumentNumberAnonymizationSettings } from "./DocumentNumberAnonymizationSettings";
import { FieldType } from "./FieldType";

export class ClassAnonymizationSettings
{
    /**
     * If set, specified fields will be anonymized on documents issued by
     * specified country only. Otherwise, issuing country will not be taken into
     * account during anonymization.
     */
    country: Country | null = null;

    /**
     * If set, specified fields will be anonymized on documents issued by
     * specified region only. Otherwise, issuing region will not be taken into
     * account during anonymization.
     */
    region: Region | null = null;

    /**
     * If set, specified fields will be anonymized on documents of specified
     * type only. Otherwise, document type will not be taken into account during
     * anonymization.
     */
    type: DocumentType | null = null;

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
