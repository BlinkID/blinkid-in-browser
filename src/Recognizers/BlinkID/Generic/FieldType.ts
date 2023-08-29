/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/** List of possible types of fields that are extracted from identity documents. */
export enum FieldType
{
    AdditionalAddressInformation = 0,
    AdditionalNameInformation = 1,
    AdditionalOptionalAddressInformation = 2,
    AdditionalPersonalIdNumber = 3,
    Address = 4,
    ClassEffectiveDate = 5,
    ClassExpiryDate = 6,
    Conditions = 7,
    DateOfBirth = 8,
    DateOfExpiry = 9,
    DateOfIssue = 10,
    DocumentAdditionalNumber = 11,
    DocumentOptionalAdditionalNumber = 12,
    DocumentNumber = 13,
    Employer = 14,
    Endorsements = 15,
    FathersName = 16,
    FirstName = 17,
    FullName = 18,
    IssuingAuthority = 19,
    LastName = 20,
    LicenceType = 21,
    LocalizedName = 22,
    MaritalStatus = 23,
    MothersName = 24,
    Mrz = 25,
    Nationality = 26,
    PersonalIdNumber = 27,
    PlaceOfBirth = 28,
    Profession = 29,
    Race = 30,
    Religion = 31,
    ResidentialStatus = 32,
    Restrictions = 33,
    Sex = 34,
    VehicleClass = 35,
    BloodType = 36,
    Sponsor = 37,

    /** Number of possible field types. */
    Count
}
