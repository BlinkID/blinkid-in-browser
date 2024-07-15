/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 *
 */

import { AlphabetType } from "./AlphabetType";
import { FieldType } from "./FieldType";

export class DetailedFieldType
{
    fieldType: FieldType;

    alphabetType: AlphabetType;

    constructor( fieldType: FieldType, alphabetType: AlphabetType )
    {
        this.fieldType = fieldType;
        this.alphabetType = alphabetType;
    }
}
