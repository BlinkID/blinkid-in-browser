/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { DriverLicenseDetailedInfo } from "./DriverLicenseDetailedInfo";
import { MBDate } from "../../../MicroblinkSDK/DataStructures";

/**
 * VIZResult contains data extracted from the Visual Inspection Zone.
 */
export interface VIZResult
{
    /** The first name of the document owner. */
    readonly firstName: string;
    /** The last name of the document owner. */
    readonly lastName: string;
    /** The full name of the document owner. */
    readonly fullName: string;
    /** The additional name information of the document owner. */
    readonly additionalNameInformation: string;
    /** The localized name of the document owner. */
    readonly localizedName: string;
    /** The fathers name of the document owner. */
    readonly fathersName: string;
    /** The mothers name of the document owner. */
    readonly mothersName: string;

    /** The address of the document owner. */
    readonly address: string;
    /** THe additional address information of the document owner. */
    readonly additionalAddressInformation: string;
    /** The place of birth of the document owner. */
    readonly placeOfBirth: string;
    /** The nationality of the document owner. */
    readonly nationality: string;

    /** The race of the document owner. */
    readonly race: string;
    /** The religion of the document owner. */
    readonly religion: string;
    /** The profession of the document owner. */
    readonly profession: string;
    /** The marital status of the document owner. */
    readonly maritalStatus: string;
    /** The residential status of the document owner. */
    readonly residentialStatus: string;
    /** The employer of the document owner. */
    readonly employer: string;
    /** The sex of the document owner. */
    readonly sex: string;

    /** The date of birth of the document owner. */
    readonly dateOfBirth: MBDate;
    /** The date of issue of the document. */
    readonly dateOfIssue: MBDate;
    /** The date of expiry of the document. */
    readonly dateOfExpiry: MBDate;

    /** Determines if date of expiry is permanent. */
    readonly dateOfExpiryPermanent: boolean;

    /** The document number. */
    readonly documentNumber: string;
    /** The personal identification number. */
    readonly personalIdNumber: string;
    /** The additional number of the document. */
    readonly documentAdditionalNumber: string;
    /** The one more additional number of the document. */
    readonly documentOptionalAdditionalNumber: string;
    /** The additional personal identification number. */
    readonly additionalPersonalIdNumber: string;
    /** The issuing authority of the document. */
    readonly issuingAuthority: string;

    /** The driver license detailed info. */
    readonly driverLicenseDetailedInfo: DriverLicenseDetailedInfo;

    /* Whether the result is empty */
    readonly empty: boolean;
}
