/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */
import
{
    MBDate
} from "../../../MicroblinkSDK/DataStructures";

/**
 * The additional information on vehicle class.
 */
export interface VehicleClassInfo
{
    readonly vehicleClass: string;

    readonly licenceType: string;

    readonly effectiveDate: MBDate;

    readonly expiryDate: MBDate;
}

/**
 * Driver's license specific data.
 */
export interface DriverLicenseDetailedInfo
{
    /** The driver license conditions. */
    readonly conditions: string;

    /**
     * The restrictions to driving privileges for the driver license owner.
     */
    readonly restrictions: string;

    /**
     * The additional privileges granted to the driver license owner.
     */
    readonly endorsements: string;

    /**
     * The type of vehicle the driver license owner has privilege to drive.
     */
    readonly vehicleClass: string;

    /**
     * The additional information on vehicle class.
     */
    readonly vehicleClassesInfo: Array< VehicleClassInfo >;
}
