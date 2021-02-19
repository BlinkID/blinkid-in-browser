/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { AddressDetailedInfo } from "./AddressDetailedInfo";
import { BarcodeData } from "../../BlinkBarcode/BarcodeData";
import { DriverLicenseDetailedInfo } from "./DriverLicenseDetailedInfo";
import { MBDate } from "../../../MicroblinkSDK/DataStructures";

/**
 * BarcodeResult contains data extracted from the barcode.
 */
export interface BarcodeResult
{
    /** The raw, unparsed barcode data. */
    readonly barcodeData : BarcodeData;

    /** The first name of the document owner. */
    readonly firstName: string;
    /** The middle name of the document owner. */
    readonly middleName: string;
    /** The last name of the document owner. */
    readonly lastName: string;
    /** The full name of the document owner. */
    readonly fullName: string;
    /** The additional name information of the document owner. */
    readonly additionalNameInformation: string;

    /** The address of the document owner. */
    readonly address: string;
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

    /** The document number. */
    readonly documentNumber: string;
    /** The personal identification number. */
    readonly personalIdNumber: string;
    /** The additional number of the document. */
    readonly documentAdditionalNumber: string;
    /** The issuing authority of the document. */
    readonly issuingAuthority: string;

    /** The details about the address of the document owner. */
    readonly addressDetailedInfo: AddressDetailedInfo;

    /* The driver license detailed info. */
    readonly driverLicenseDetailedInfo: DriverLicenseDetailedInfo;

    /* Whether the result is empty */
    readonly empty: boolean;

    /**
     * Document specific extended elements that contain all barcode fields in their original form.
     * The indices of specific data within the array are given by the BarcodeElementKey enum.
     *
     * For example, to obtain the first name you can use extendedElements[BarcodeElementKey.CustomerFirstName].
     *
     * Currently this is only filled for AAMVACompliant documents.
     */
    readonly extendedElements: Array<string>;
}

/**
* Enum defining additional fields present in the barcode.
* Currently this is only used for AAMVACompliant documents.
*/
export enum BarcodeElementKey
{

    // ==============================================================/
    // ============== 1. DETERMINING BARCODE VERSION ================/
    // ==============================================================/

    /**
     Mandatory on all driver's licenses. All barcodes which are using 3-track magnetic
     stripe encoding used in the interest of smoothing a transition from legacy documents
     shall be designated as "Magnetic". All barcodes which are using compact encoding
     compliant with ISO/IEC 18013-2 shall be designated as "Compact". All barcodes (majority)
     compliant with Mandatory PDF417 Bar Code of the American Association of Motor Vehicle
     Administrators (AAMVA) Card Design Standard from AAMVA DL/ID-2000 standard to DL/ID-2013
     shall be designated as "AAMVA".
     */
    DocumentType = 0,

    /**
     Mandatory on all driver's licenses.

     AAMVA Version Number: This is a decimal value between 0 and 99 that
     specifies the version level of the PDF417 bar code format. Version "0" and "00"
     is reserved for bar codes printed to the specification of the American Association
     of Motor Vehicle Administrators (AAMVA) prior to the adoption of the AAMVA DL/ID-2000
     standard.

     - All barcodes compliant with AAMVA DL/ID-2000 standard shall be designated Version "01."
     - All barcodes compliant with AAMVA Card Design Specification version 1.0, dated 09-2003
       shall be designated Version "02."
     - All barcodes compliant with AAMVA Card Design Specification version 2.0, dated 03-2005
       shall be designated Version "03."
     - All barcodes compliant with AAMVA Card Design Standard version 1.0, dated 07-2009
       shall be designated Version "04."
     - All barcodes compliant with AAMVA Card Design Standard version 1.0, dated 07-2010
       shall be designated Version "05."
     - All barcodes compliant with AAMVA Card Design Standard version 1.0, dated 07-2011
       shall be designated Version "06".
     - All barcodes compliant with AAMVA Card Design Standard version 1.0, dated 06-2012
       shall be designated Version "07".
     - All barcodes compliant with this current AAMVA standard shall be designated "08".

     Should a need arise requiring major revision to the format, this field provides the
     means to accommodate additional revision.

     If the document type is not "AAMVA", this field defines the version number of the
     given document type's standard.
     */
    StandardVersionNumber,

    // ==============================================================/
    // ==========          2. PERSONAL DATA KEYS          ===========/
    // ==============================================================/

    /**
     Mandatory on all AAMVA, Magnetic and Compact barcodes.

     Family name of the cardholder. (Family name is sometimes also called "last name" or "surname.")
     Collect full name for record, print as many characters as possible on portrait side of DL/ID.
     */
    CustomerFamilyName,

    /**
     Mandatory on all AAMVA, Magnetic and Compact barcodes.

     First name of the cardholder.
     */
    CustomerFirstName,

    /**
     Mandatory on all AAMVA, Magnetic and Compact barcodes.

     Full name of the individual holding the Driver's License or ID.

     The Name field contains up to four portions, separated with the "," delimiter:
     Last Name (required)
     , (required)
     First Name (required)
     , (required if other name portions follow, otherwise optional)
     Middle Name(s) (optional)
     , (required if other name portions follow, otherwise optional)
     Suffix (optional)
     , (optional)

     If the individual has more than one middle name they are separated with space.
     */
    CustomerFullName,

    /**
     Mandatory on all AAMVA, Magnetic and Compact barcodes.

     Date on which the cardholder was born. (MMDDCCYY format)
     */
    DateOfBirth,

    /**
     Mandatory on all AAMVA, Magnetic barcodes.
     Optional on Compact barcodes.

     Gender of the cardholder. 1 = male, 2 = female.
     */
    Sex,

    /**
     Mandatory on AAMVA 02, 03, 04, 05, 06, 07, 08 barcodes.
     Optional on AAMVA 01, Magnetic and Compact barcodes.

     Color of cardholder's eyes. (ANSI D-20 codes)

     Code   Description
     BLK    Black
     BLU    Blue
     BRO    Brown
     GRY    Gray
     GRN    Green
     HAZ    Hazel
     MAR    Maroon
     PNK    Pink
     DIC    Dichromatic
     UNK    Unknown
     */
    EyeColor,

    /**
     Mandatory on all AAMVA and Magnetic barcodes.

     On compact barcodes, use kFullAddress.

     Street portion of the cardholder address.
     The place where the registered driver of a vehicle (individual or corporation)
     may be contacted such as a house number, street address, etc.
     */
    AddressStreet,

    /**
     Mandatory on all AAMVA and Magnetic barcodes.

     On compact barcodes, use kFullAddress.

     City portion of the cardholder address.
     */
    AddressCity,

    /**
     Mandatory on all AAMVA and Magnetic barcodes.

     On compact barcodes, use kFullAddress.

     State portion of the cardholder address.
     */
    AddressJurisdictionCode,

    /**
     Mandatory on all AAMVA and Magnetic barcodes.

     On compact barcodes, use FullAddress.

     Postal code portion of the cardholder address in the U.S. and Canada. If the
     trailing portion of the postal code in the U.S. is not known, zeros can be used
     to fill the trailing set of numbers up to nine (9) digits.
     */
    AddressPostalCode,

    /**
     Mandatory on all AAMVA and Magnetic barcodes.
     Optional on Compact barcodes.

     Full address of the individual holding the Driver's License or ID.

     The full address field contains up to four portions, separated with the "," delimiter:
     Street Address (required)
     , (required if other address portions follow, otherwise optional)
     City (optional)
     , (required if other address portions follow, otherwise optional)
     Jurisdiction Code (optional)
     , (required if other address portions follow, otherwise optional)
     ZIP - Postal Code (optional)

     */
    FullAddress,

    /**
     Mandatory on AAMVA 02, 03, 04, 05, 06, 07, 08 and Compact barcodes.
     Optional on AAMVA 01 and Magnetic barcodes.

     Height of cardholder, either in Inches or in Centimeters.

     Inches (in): number of inches followed by " in"
     example: 6'1'' = "73 in"

     Centimeters (cm): number of centimeters followed by " cm"
     example: 181 centimeters = "181 cm"
     */
    Height,

    /**
     Mandatory on AAMVA 02, 03, 04, 05, 06, 07, 08 and Compact barcodes.
     Optional on AAMVA 01 and Magnetic barcodes.

     Height of cardholder in Inches.
     Example: 5'9'' = "69".
     */
    HeightIn,

    /**
     Mandatory on AAMVA 02, 03, 04, 05, 06, 07, 08 Compact barcodes.
     Optional on AAMVA 01 and Magnetic barcodes.

     Height of cardholder in Centimeters.
     Example: 180 Centimeters = "180".
     */
    HeightCm,

    /**
     Mandatory on AAMVA 04, 05, 06, 07, 08 barcodes.
     Optional on AAMVA 01, 02, 03, Magnetic and Compcat barcodes.

     Middle name(s) of the cardholder. In the case of multiple middle names they
     shall be separated by space " ".
     */
    CustomerMiddleName,

    /**
     Optional on all AAMVA, Magnetic and Compact barcodes.

     Bald, black, blonde, brown, gray, red/auburn, sandy, white, unknown. If the issuing
     jurisdiction wishes to abbreviate colors, the three-character codes provided in ANSI D20 must be
     used.

     Code   Description
     BAL    Bald
     BLK    Black
     BLN    Blond
     BRO    Brown
     GRY    Grey
     RED    Red/Auburn
     SDY    Sandy
     WHI    White
     UNK    Unknown
     */
    HairColor,

    /**
     Mandatory on AAMVA 02 barcodes.
     Optional on AAMVA 01, 03, 04, 05, 06, 07, 08, Magnetic and Compact barcodes.

     Name Suffix (If jurisdiction participates in systems requiring name suffix (PDPS, CDLIS, etc.),
     the suffix must be collected and displayed on the DL/ID and in the MRT).
     - JR (Junior)
     - SR (Senior)
     - 1ST or I (First)
     - 2ND or II (Second)
     - 3RD or III (Third)
     - 4TH or IV (Fourth)
     - 5TH or V (Fifth)
     - 6TH or VI (Sixth)
     - 7TH or VII (Seventh)
     - 8TH or VIII (Eighth)
     - 9TH or IX (Ninth)
     */
    NameSuffix,

    /**
     Optional on all AAMVA and Compact barcodes.

     Other name by which the cardholder is known. ALTERNATIVE NAME(S) of the individual
     holding the Driver License or ID.

     The Name field contains up to four portions, separated with the "," delimiter:
     AKA Last Name (required)
     , (required)
     AKA First Name (required)
     , (required if other name portions follow, otherwise optional)
     AKA Middle Name(s) (optional)
     , (required if other name portions follow, otherwise optional)
     AKA Suffix (optional)
     , (optional)

     If the individual has more than one AKA middle name they are separated with space.
     */
    AKAFullName,

    /**
     Optional on all AAMVA and Compact barcodes.

     Other family name by which the cardholder is known.
     */
    AKAFamilyName,

    /**
     Optional on all AAMVA and Compact barcodes.

     Other given name by which the cardholder is known
     */
    AKAGivenName,

    /**
     Optional on all AAMVA and Compact barcodes.

     Other suffix by which the cardholder is known.

     The Suffix Code Portion, if submitted, can contain only the Suffix Codes shown in the following
     table (e.g., Andrew Johnson, III = JOHNSON@ANDREW@@3RD):

     Suffix     Meaning or Synonym
     JR         Junior
     SR         Senior or Esquire 1ST First
     2ND        Second
     3RD        Third
     4TH        Fourth
     5TH        Fifth
     6TH        Sixth
     7TH        Seventh
     8TH        Eighth
     9TH        Ninth
     */
    AKASuffixName,

    /**
     Mandatory on AAMVA 02 barcodes.
     Optional on AAMVA 01, 03, 04, 05, 06, 07, 08, Magnetic and Compact barcodes.

     Indicates the approximate weight range of the cardholder:
     0 = up to 31 kg (up to 70 lbs)
     1 = 32 – 45 kg (71 – 100 lbs)
     2 = 46 - 59 kg (101 – 130 lbs)
     3 = 60 - 70 kg (131 – 160 lbs)
     4 = 71 - 86 kg (161 – 190 lbs)
     5 = 87 - 100 kg (191 – 220 lbs)
     6 = 101 - 113 kg (221 – 250 lbs)
     7 = 114 - 127 kg (251 – 280 lbs)
     8 = 128 – 145 kg (281 – 320 lbs)
     9 = 146+ kg (321+ lbs)
     */
    WeightRange,

    /**
     Mandatory on AAMVA 02 barcodes.
     Optional on AAMVA 01, 03, 04, 05, 06, 07, 08, Magnetic and Compact barcodes.

     Cardholder weight in pounds Example: 185 lb = "185"
     */
    WeightPounds,

    /**
     Mandatory on AAMVA 02 barcodes.
     Optional on AAMVA 01, 03, 04, 05, 06, 07, 08, Magnetic and Compact barcodes.

     Cardholder weight in kilograms Example: 84 kg = "084"
     */
    WeightKilograms,

    /**
     Mandatory on all AAMVA and Compact barcodes.

     The number assigned or calculated by the issuing authority.
     */
    CustomerIdNumber,

    /**
     Mandatory on AAMVA 04, 05, 06, 07, 08 barcodes.
     Optional on Compact barcodes.

     A code that indicates whether a field has been truncated (T), has not been
     truncated (N), or – unknown whether truncated (U).
     */
    FamilyNameTruncation,

    /**
     Mandatory on AAMVA 04, 05, 06, 07, 08 barcodes.
     Optional on Compact barcodes.

     A code that indicates whether a field has been truncated (T), has not been
     truncated (N), or – unknown whether truncated (U).
     */
    FirstNameTruncation,

    /**
     Mandatory on AAMVA 04, 05, 06, 07, 08 barcodes.

     A code that indicates whether a field has been truncated (T), has not been
     truncated (N), or – unknown whether truncated (U).
     */
    MiddleNameTruncation,

    /**
     Optional on AAMVA 02, 03, 04, 05, 06, 07, 08 and Compact barcodes.

     Country and municipality and/or state/province.
     */
    PlaceOfBirth,

    /**
     Optional on all AAMVA barcodes.

     On Compact barcodes, use kFullAddress.

     Second line of street portion of the cardholder address.
     */
    AddressStreet2,

    /**
     Optional on AAMVA 02, 03, 04, 05, 06, 07, 08 and Compact barcodes.

     Codes for race or ethnicity of the cardholder, as defined in ANSI D20.

     Race:
     Code   Description
     AI     Alaskan or American Indian (Having Origins in Any of The Original Peoples of
            North America, and Maintaining Cultural Identification Through Tribal
            Affiliation of Community Recognition)
     AP     Asian or Pacific Islander (Having Origins in Any of the Original Peoples of
            the Far East, Southeast Asia, or Pacific Islands. This Includes China, India,
            Japan, Korea, the Philippines Islands, and Samoa)
     BK     Black (Having Origins in Any of the Black Racial Groups of Africa)
     W      White (Having Origins in Any of The Original Peoples of Europe, North Africa,
            or the Middle East)

     Ethnicity:
     Code   Description
     H      Hispanic Origin (A Person of Mexican, Puerto Rican, Cuban, Central or South
            American or Other Spanish Culture or Origin, Regardless of Race)
     O      Not of Hispanic Origin (Any Person Other Than Hispanic)
     U      Unknown

     */
    RaceEthnicity,

    /**
     Optional on AAMVA 01 barcodes.

     PREFIX to Driver Name. Freeform as defined by issuing jurisdiction.
     */
    NamePrefix,

    /**
     Mandatory on AAMVA 02, 03, 04, 05, 06, 07, 08 and Compact barcodes.

     Country in which DL/ID is issued. U.S. = USA, Canada = CAN.
     */
    CountryIdentification,

    /**
     Optional on AAMVA version 01.

     Driver Residence Street Address 1.
     */
    ResidenceStreetAddress,

    /**
     Optional on AAMVA version 01.

     Driver Residence Street Address 2.
     */
    ResidenceStreetAddress2,

    /**
     Optional on AAMVA version 01.

     Driver Residence City
     */
    ResidenceCity,

    /**
     Optional on AAMVA version 01.

     Driver Residence Jurisdiction Code.
     */
    ResidenceJurisdictionCode,

    /**
     Optional on AAMVA 01 barcodes.

     Driver Residence Postal Code.
     */
    ResidencePostalCode,

    /**
     Optional on AAMVA 01 barcodes.

     Full residence address of the individual holding the Driver's License or ID.

     The full address field contains up to four portions, separated with the "," delimiter:
     Residence Street Address (required)
     , (required if other address portions follow, otherwise optional)
     Residence City (optional)
     , (required if other address portions follow, otherwise optional)
     Residence Jurisdiction Code (optional)
     , (required if other address portions follow, otherwise optional)
     Residence ZIP - Residence Postal Code (optional)
     */
    ResidenceFullAddress,

    /**
     Optional on AAMVA 05, 06, 07, 08 barcodes.

     Date on which the cardholder turns 18 years old. (MMDDCCYY format)
     */
    Under18,

    /**
     Optional on AAMVA 05, 06, 07, 08 barcodes.

     Date on which the cardholder turns 19 years old. (MMDDCCYY format)
     */
    Under19,

    /**
     Optional on AAMVA 05, 06, 07, 08 barcodes.

     Date on which the cardholder turns 21 years old. (MMDDCCYY format)
     */
    Under21,

    /**
     Optional on AAMVA version 01.

     The number assigned to the individual by the Social Security Administration.
     */
    SocialSecurityNumber,

    /**
     Optional on AAMVA version 01.

     Driver "AKA" Social Security Number. FORMAT SAME AS DRIVER SOC SEC NUM. ALTERNATIVE NUMBERS(S) used as SS NUM.
     */
    AKASocialSecurityNumber,

    /**
     Optional on AAMVA 01 barcodes.

     ALTERNATIVE MIDDLE NAME(s) or INITIALS of the individual holding the Driver License or ID.
     Hyphenated names acceptable, spaces between names acceptable, but no other
     use of special symbols.
     */
    AKAMiddleName,

    /**
     Optional on AAMVA 01 barcodes.

     ALTERNATIVE PREFIX to Driver Name. Freeform as defined by issuing jurisdiction.
     */
    AKAPrefixName,

    /**
     Optional on AAMVA 01, 06, 07, 08 barcodes.

     Field that indicates that the cardholder is an organ donor = "1".
     */
    OrganDonor,

    /**
     Optional on AAMVA 07, 08 barcodes.

     Field that indicates that the cardholder is a veteran = "1"
     */
    Veteran,

    /**
     Optional on AAMVA 01. (MMDDCCYY format)

     ALTERNATIVE DATES(S) given as date of birth.
     */
    AKADateOfBirth,


    // ==============================================================/
    // ==========          3. LICENSE DATA KEYS          ============/
    // ==============================================================/

    /**
     Mandatory on all AAMVA, Magnetic and Compact barcodes.

     This number uniquely identifies the issuing jurisdiction and can
     be obtained by contacting the ISO Issuing Authority (AAMVA)
     */
    IssuerIdentificationNumber,

    /**
     Mandatory on all AAMVA, Magnetic and Compact barcodes.

     If the document is non expiring then "Non expiring" is written in this field.

     Date on which the driving and identification privileges granted by the document are
     no longer valid. (MMDDCCYY format)
     */
    DocumentExpirationDate,

    /**
     Mandatory on all AAMVA and Compact barcodes.
     Optional on Magnetic barcodes.

     Jurisdiction Version Number: This is a decimal value between 0 and 99 that
     specifies the jurisdiction version level of the PDF417 barcode format.
     Notwithstanding iterations of this standard, jurisdictions implement incremental
     changes to their barcodes, including new jurisdiction-specific data, compression
     algorithms for digitized images, digital signatures, or new truncation
     conventions used for names and addresses. Each change to the barcode format
     within each AAMVA version (above) must be noted, beginning with Jurisdiction
     Version 00.
     */
    JurisdictionVersionNumber,

    /**
     Mandatory on all AAMVA and Magnetic barcodes.

     Jurisdiction-specific vehicle class / group code, designating the type
     of vehicle the cardholder has privilege to drive.
     */
    JurisdictionVehicleClass,

    /**
     Mandatory on all AAMVA barcodes.
     Optional on Magnetic barcodes.

     Jurisdiction-specific codes that represent restrictions to driving
     privileges (such as airbrakes, automatic transmission, daylight only, etc.).
     */
    JurisdictionRestrictionCodes,

    /**
     Mandatory on all AAMVA barcodes.
     Optional on Magnetic barcodes.

     Jurisdiction-specific codes that represent additional privileges
     granted to the cardholder beyond the vehicle class (such as transportation of
     passengers, hazardous materials, operation of motorcycles, etc.).
     */
    JurisdictionEndorsementCodes,

    /**
     Mandatory on all AAMVA and Compact barcodes.

     Date on which the document was issued. (MMDDCCYY format)
     */
    DocumentIssueDate,

    /**
     Mandatory on AAMVA versions 02 and 03.

     Federally established codes for vehicle categories, endorsements, and restrictions
     that are generally applicable to commercial motor vehicles. If the vehicle is not a
     commercial vehicle, "NONE" is to be entered.
     */
    FederalCommercialVehicleCodes,

    /**
     Optional on all AAMVA barcodes.
     Mandatory on Compact barcodes.

     Jurisdictions may define a subfile to contain jurisdiction-specific information.
     These subfiles are designated with the first character of “Z” and the second
     character is the first letter of the jurisdiction's name. For example, "ZC" would
     be the designator for a California or Colorado jurisdiction-defined subfile, "ZQ"
     would be the designator for a Quebec jurisdiction-defined subfile. In the case of
     a jurisdiction-defined subfile that has a first letter that could be more than
     one jurisdiction (e.g. California, Colorado, Connecticut) then other data, like
     the IIN or address, must be examined to determine the jurisdiction.
     */
    IssuingJurisdiction,

    /**
     Optional on all AAMVA barcodes.
     Mandatory on Compact barcodes.

     Standard vehicle classification code(s) for cardholder. This data element is a
     placeholder for future efforts to standardize vehicle classifications.
     */
    StandardVehicleClassification,

    /**
      Optional on all AAMVA and Magnetic barcodes.

      Name of issuing jurisdiction, for example: Alabama, Alaska ...
      */
    IssuingJurisdictionName,

    /**
     Optional on all AAMVA barcodes.

     Standard endorsement code(s) for cardholder. See codes in D20. This data element is a
     placeholder for future efforts to standardize endorsement codes.

     Code   Description
     H      Hazardous Material - This endorsement is required for the operation of any vehicle
            transporting hazardous materials requiring placarding, as defined by U.S.
            Department of Transportation regulations.
     L      Motorcycles – Including Mopeds/Motorized Bicycles.
     N      Tank - This endorsement is required for the operation of any vehicle transporting,
            as its primary cargo, any liquid or gaseous material within a tank attached to the vehicle.
     O      Other Jurisdiction Specific Endorsement(s) - This code indicates one or more
            additional jurisdiction assigned endorsements.
     P      Passenger - This endorsement is required for the operation of any vehicle used for
            transportation of sixteen or more occupants, including the driver.
     S      School Bus - This endorsement is required for the operation of a school bus. School bus means a
            CMV used to transport pre-primary, primary, or secondary school students from home to school,
            from school to home, or to and from school sponsored events. School bus does not include a
            bus used as common carrier (49 CRF 383.5).
     T      Doubles/Triples - This endorsement is required for the operation of any vehicle that would be
            referred to as a double or triple.
     X      Combined Tank/HAZ-MAT - This endorsement may be issued to any driver who qualifies for
            both the N and H endorsements.
     */
    StandardEndorsementCode,

    /**
     Optional on all AAMVA barcodes.

     Standard restriction code(s) for cardholder. See codes in D20. This data element is a placeholder
     for future efforts to standardize restriction codes.

     Code   Description
     B      Corrective Lenses
     C      Mechanical Devices (Special Brakes, Hand Controls, or Other Adaptive Devices)
     D      Prosthetic Aid
     E      Automatic Transmission
     F      Outside Mirror
     G      Limit to Daylight Only
     H      Limit to Employment
     I      Limited Other
     J      Other
     K      CDL Intrastate Only
     L      Vehicles without air brakes
     M      Except Class A bus
     N      Except Class A and Class B bus
     O      Except Tractor-Trailer
     V      Medical Variance Documentation Required
     W      Farm Waiver
     */
    StandardRestrictionCode,

    /**
     Optional on AAMVA 02, 03, 04, 05, 06, 07, 08 and Compact barcodes.

     Text that explains the jurisdiction-specific code(s) for classifications
     of vehicles cardholder is authorized to drive.
     */
    JurisdictionVehicleClassificationDescription,

    /**
     Optional on AAMVA 02, 03, 04, 05, 06, 07, 08 and Compact barcodes.

     Text that explains the jurisdiction-specific code(s) that indicates additional
     driving privileges granted to the cardholder beyond the vehicle class.
     */
    JurisdictionEndorsmentCodeDescription,

    /**
     Optional on AAMVA 02, 03, 04, 05, 06, 07, 08 and Compact barcodes.

     Text describing the jurisdiction-specific restriction code(s) that curtail driving privileges.
     */
    JurisdictionRestrictionCodeDescription,

    /**
     Optional on AAMVA 02, 03, 04, 05, 06, 07, 08 barcodes.

     A string of letters and/or numbers that is affixed to the raw materials (card stock,
     laminate, etc.) used in producing driver's licenses and ID cards. (DHS recommended field)
     */
    InventoryControlNumber,

    /**
     Optional on AAMVA 04, 05, 06, 07, 08 and Compact barcodes.

     DHS required field that indicates date of the most recent version change or
     modification to the visible format of the DL/ID. (MMDDCCYY format)
     */
    CardRevisionDate,

    /**
     Mandatory on AAMVA 02, 03, 04, 05, 06, 07, 08 and Magnetic barcodes.
     Optional and Compact barcodes.

     Number must uniquely identify a particular document issued to that customer
     from others that may have been issued in the past. This number may serve multiple
     purposes of document discrimination, audit information number, and/or inventory control.
     */
    DocumentDiscriminator,

    /**
     Optional on AAMVA 04, 05, 06, 07, 08 and Compact barcodes.

     DHS required field that indicates that the cardholder has temporary lawful status = "1".
     */
    LimitedDurationDocument,

    /**
     Optional on AAMVA 02, 03, 04, 05, 06, 07, 08 and Compact barcodes.

     A string of letters and/or numbers that identifies when, where, and by whom a driver's
     license/ID card was made. If audit information is not used on the card or the MRT, it
     must be included in the driver record.
     */
    AuditInformation,

    /**
     Optional on AAMVA 04, 05, 06, 07, 08 and Compact barcodes.

     DHS required field that indicates compliance: "M" = materially compliant,
     "F" = fully compliant, and, "N" = non-compliant.
     */
    ComplianceType,

    /**
     Optional on AAMVA version 01 barcodes.

     Issue Timestamp. A string used by some jurisdictions to validate the document against their data base.
     */
    IssueTimestamp,

    /**
     Optional on AAMVA version 01 barcodes.

     Driver Permit Expiration Date. MMDDCCYY format. Date permit expires.
     */
    PermitExpirationDate,

    /**
     Optional on AAMVA version 01 barcodes..

     Type of permit.
     */
    PermitIdentifier,

    /**
     Optional on AAMVA version 01 barcodes..

     Driver Permit Issue Date. MMDDCCYY format. Date permit was issued.
     */
    PermitIssueDate,

    /**
     Optional on AAMVA version 01.

     Number of duplicate cards issued for a license or ID if any.
     */
    NumberOfDuplicates,

    /**
     Optional on AAMVA 04, 05, 06, 07, 08 and Compact barcodes.

     Date on which the hazardous material endorsement granted by the document is
     no longer valid. (MMDDCCYY format)
     */
    HAZMATExpirationDate,

    /**
     Optional on AAMVA version 01.

     Medical Indicator/Codes.
     STATE SPECIFIC. Freeform, Standard "TBD"
     */
    MedicalIndicator,

    /**
     Optional on AAMVA version 01.

     Non-Resident Indicator. "Y". Used by some jurisdictions to indicate holder of the document is a non-resident.
     */
    NonResident,

    /**
     Optional on AAMVA version 01.

     A number or alphanumeric string used by some jurisdictions to identify a "customer" across multiple data bases.
     */
    UniqueCustomerId,

    /**
     Optional on compact barcodes.

     Document discriminator.
     */
    DataDiscriminator,

    /**
     Optional on Magnetic barcodes.

     Month on which the driving and identification privileges granted by the document are
     no longer valid. (MMYY format)
     */
    DocumentExpirationMonth,

    /**
     Optional on Magnetic barcodes.

     Field that indicates that the driving and identification privileges granted by the
     document are nonexpiring = "1".
     */
    DocumentNonexpiring,

    /**
      Optional on Magnetic barcodes.

      Security version beeing used.
    */
    SecurityVersion,

    /**
      Number of keys in enum.
    */
    Count
}
