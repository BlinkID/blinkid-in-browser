/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { DriverLicenseDetailedInfo } from "./DriverLicenseDetailedInfo";
import { DateResult, StringResult } from "./GenericResultStructures";

/**
 * VIZResult contains data extracted from the Visual Inspection Zone.
 */
export interface VIZResult
{
    /** The first name of the document owner. */
    readonly firstName: StringResult;
    /** The last name of the document owner. */
    readonly lastName: StringResult;
    /** The full name of the document owner. */
    readonly fullName: StringResult;
    /** The additional name information of the document owner. */
    readonly additionalNameInformation: StringResult;
    /** The localized name of the document owner. */
    readonly localizedName: StringResult;
    /** The fathers name of the document owner. */
    readonly fathersName: StringResult;
    /** The mothers name of the document owner. */
    readonly mothersName: StringResult;

    /** The address of the document owner. */
    readonly address: StringResult;
    /** THe additional address information of the document owner. */
    readonly additionalAddressInformation: StringResult;
    /** The place of birth of the document owner. */
    readonly placeOfBirth: StringResult;
    /** The nationality of the document owner. */
    readonly nationality: StringResult;

    /** The race of the document owner. */
    readonly race: StringResult;
    /** The religion of the document owner. */
    readonly religion: StringResult;
    /** The profession of the document owner. */
    readonly profession: StringResult;
    /** The marital status of the document owner. */
    readonly maritalStatus: StringResult;
    /** The residential status of the document owner. */
    readonly residentialStatus: StringResult;
    /** The employer of the document owner. */
    readonly employer: StringResult;
    /** The sex of the document owner. */
    readonly sex: StringResult;

    /** The date of birth of the document owner. */
    readonly dateOfBirth: DateResult;
    /** The date of issue of the document. */
    readonly dateOfIssue: DateResult;
    /** The date of expiry of the document. */
    readonly dateOfExpiry: DateResult;

    /** Determines if date of expiry is permanent. */
    readonly dateOfExpiryPermanent: boolean;

    /** The document number. */
    readonly documentNumber: StringResult;
    /** The personal identification number. */
    readonly personalIdNumber: StringResult;
    /** The additional number of the document. */
    readonly documentAdditionalNumber: StringResult;
    /** The one more additional number of the document. */
    readonly documentOptionalAdditionalNumber: StringResult;
    /** The additional personal identification number. */
    readonly additionalPersonalIdNumber: StringResult;
    /** The issuing authority of the document. */
    readonly issuingAuthority: StringResult;

    /** The driver license detailed info. */
    readonly driverLicenseDetailedInfo: DriverLicenseDetailedInfo;

    /** Sponsor for a document owner. */
    readonly sponsor: StringResult;

    /** Blood type on a document owner. */
    readonly bloodType: StringResult;

    /** Subtype of a document */
    readonly documentSubtype: StringResult;

    /* Whether the result is empty */
    readonly empty: boolean;
}
