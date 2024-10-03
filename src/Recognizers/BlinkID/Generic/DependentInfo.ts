/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { StringResult } from "./GenericResultStructures";

/**
 * The additional information on the document owner's dependents.
 */
export interface DependentInfo
{
    /**
     * The date of birth of the dependent.
     */
    readonly dateOfBirth: StringResult;

    /**
     * The sex or gender of the dependent.
     */
    readonly sex: StringResult;

    /**
     * The document number of the dependent.
     */
     readonly documentNumber: StringResult;

     /**
      * The full name of the dependent.
      */
    readonly fullName: StringResult;
}
