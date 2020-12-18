/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * Detailed information about the address.
 */
export interface AddressDetailedInfo
{
    /** The address street portion of the document owner. */
    readonly street: string;

    /** The address postal code portion of the document owner. */
    readonly postalCode: string;

    /** The address city portion of the document owner. */
    readonly city: string;

    /** The address jurisdiction code portion of the document owner. */
    readonly jurisdiction: string;
}
