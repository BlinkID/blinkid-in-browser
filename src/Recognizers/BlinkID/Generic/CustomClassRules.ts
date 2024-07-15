/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 *
 */

import { ClassFilter } from "./ClassFilter";
import { DetailedFieldType } from "./DetailedFieldType";

export class CustomClassRules
{
    /**
     * Specified fields will overrule our class field rules if filter conditions are met.
     */
    classFilter: ClassFilter = new ClassFilter();

    /**
     * Fields to overrule our class field rules.
     */
    fields: Array<DetailedFieldType> = new Array<DetailedFieldType>();
}
