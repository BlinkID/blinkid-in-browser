/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

export enum LicenseTokenState
{
    Invalid,
    RequiresServerPermission,
    Valid
}

export interface LicenseUnlockResult
{
    readonly allowRemoveDemoOverlay       : boolean;
    readonly allowRemoveProductionOverlay : boolean;
    readonly isTrial                      : boolean;
    readonly licenseId                    : string;
    readonly licensee                     : string;
    readonly packageName                  : string;
    readonly sdkName                      : string;
    readonly sdkVersion                   : string;
    readonly unlockResult                 : LicenseTokenState;
    readonly licenseError                 : string;
}

export enum LicenseErrorType {
    LicenseTokenStateInvalid              = "LICENSE_TOKEN_STATE_INVALID",
    NetworkError                          = "NETWORK_ERROR",
    RemoteLock                            = "REMOTE_LOCK",
    PermissionExpired                     = "PERMISSION_EXPIRED",
    PayloadCorrupted                      = "PAYLOAD_CORRUPTED",
    PayloadSignatureVerificationFailed    = "PAYLOAD_SIGNATURE_VERIFICATION_FAILED",
    IncorrectTokenState                   = "INCORRECT_TOKEN_STATE"
}
export class LicenseErrorResponse
{
    readonly code: string = "UNLOCK_LICENSE_ERROR";

    type: LicenseErrorType;

    message?: string | null = null;

    constructor( type: LicenseErrorType, message?: string )
    {
        this.type = type;

        if ( message )
        {
            this.message = message;
        }
    }
}

const baltazar = "https://baltazar.microblink.com/api/v1/status/check";

interface BaltazarRequest
{
    readonly licenseId  : string;
    readonly licensee   : string;
    readonly packageName: string;
    readonly platform   : string;
    readonly sdkName    : string;
    readonly sdkVersion : string;
}

function toBaltazarRequest( unlockResult: LicenseUnlockResult ): BaltazarRequest
{
    return {
        licenseId  : unlockResult.licenseId,
        licensee   : unlockResult.licensee,
        packageName: unlockResult.packageName,
        platform   : "Browser",
        sdkName    : unlockResult.sdkName,
        sdkVersion : unlockResult.sdkVersion
    };
}

function shouldShowOverlay(
    isTrial: boolean,
    allowRemoveDemoOverlay: boolean,
    allowRemoveProductionOverlay: boolean
): boolean
{
    if ( isTrial && allowRemoveDemoOverlay )
    {
        return false;
    }

    if ( !isTrial && allowRemoveProductionOverlay )
    {
        return false;
    }

    return true;
}

export enum ServerPermissionSubmitResultStatus
{
    Ok = 0,
    NetworkError,
    RemoteLock,
    PermissionExpired,
    PayloadCorrupted,
    PayloadSignatureVerificationFailed,
    IncorrectTokenState
}

export interface ServerPermissionSubmitResult
{
    readonly status: ServerPermissionSubmitResultStatus;
    readonly lease: number;
    readonly networkErrorDescription?: string;
}

export interface UnlockResult
{
    readonly error: LicenseErrorResponse | null;
    readonly lease?: number;
    readonly showOverlay?: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any,
                  @typescript-eslint/explicit-module-boundary-types,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-call
*/
export async function obtainNewServerPermission
(
    unlockResult: LicenseUnlockResult,
    wasmModule  : any
): Promise< ServerPermissionSubmitResult >
{
    // request permission from Baltazar service
    try
    {
        const response = await fetch
        (
            baltazar,
            {
                method: "POST",
                headers:
                {
                    "Content-Type": "application/json"
                },
                cache: "no-cache",
                body: JSON.stringify( toBaltazarRequest( unlockResult ) )
            }
        );
        if ( response.ok )
        {
            const serverPermission = ( await response.text() ).toString();
            const result = wasmModule.submitServerPermission( serverPermission ) as ServerPermissionSubmitResult;
            return result;
        }
        else
        {
            return {
                status: ServerPermissionSubmitResultStatus.NetworkError,
                lease: 0,
                networkErrorDescription: `Server responded with status ${response.status}`
            };
        }
    }
    catch( error )
    {
        return {
            status: ServerPermissionSubmitResultStatus.NetworkError,
            lease: 0,
            networkErrorDescription: `Unexpected error: ${JSON.stringify( error )}`
        };
    }
}

export async function unlockWasmSDK
(
    licenseKey       : string,
    allowHelloMessage: boolean,
    userId           : string,
    wasmModule       : any
): Promise< UnlockResult >
{
    const unlockResult = wasmModule.initializeWithLicenseKey
    (
        licenseKey,
        userId,
        allowHelloMessage
    ) as LicenseUnlockResult;

    switch( unlockResult.unlockResult )
    {
        case LicenseTokenState.Invalid:
            return {
                error: new LicenseErrorResponse (
                    LicenseErrorType.LicenseTokenStateInvalid,
                    unlockResult.licenseError
                )
            };
        case LicenseTokenState.Valid:
            return {
                error: null,
                showOverlay: shouldShowOverlay(
                    unlockResult.isTrial,
                    unlockResult.allowRemoveDemoOverlay,
                    unlockResult.allowRemoveProductionOverlay
                )
            };
        case LicenseTokenState.RequiresServerPermission:
        {
            const serverPermission = await obtainNewServerPermission( unlockResult, wasmModule );
            switch ( serverPermission.status )
            {
                case ServerPermissionSubmitResultStatus.Ok:
                    return {
                        error: null,
                        lease: serverPermission.lease
                    };
                case ServerPermissionSubmitResultStatus.NetworkError:
                {
                    let additionalInfo = "";
                    if ( serverPermission.networkErrorDescription )
                    {
                        additionalInfo = " " + serverPermission.networkErrorDescription;
                    }

                    return {
                        error: new LicenseErrorResponse (
                            LicenseErrorType.NetworkError,
                            "There has been a network error while obtaining the server permission!" + additionalInfo
                        )
                    };
                }
                case ServerPermissionSubmitResultStatus.RemoteLock:
                    return {
                        error: new LicenseErrorResponse (
                            LicenseErrorType.RemoteLock,
                            "Provided license key has been remotely locked." +
                            "Please contact support for more information!"
                        ),
                        lease: serverPermission.lease
                    };
                case ServerPermissionSubmitResultStatus.PermissionExpired:
                    return {
                        error: new LicenseErrorResponse (
                            LicenseErrorType.PermissionExpired,
                            "Internal error (server permission expired)"
                        ),
                        lease: serverPermission.lease
                    };
                case ServerPermissionSubmitResultStatus.PayloadCorrupted:
                    return {
                        error: new LicenseErrorResponse (
                            LicenseErrorType.PayloadCorrupted,
                            "Server permission payload is corrupted!"
                        ),
                        lease: serverPermission.lease
                    };
                case ServerPermissionSubmitResultStatus.PayloadSignatureVerificationFailed:
                    return {
                        error: new LicenseErrorResponse (
                            LicenseErrorType.PayloadSignatureVerificationFailed,
                            "Failed to verify server permission's digital signature!"
                        ),
                        lease: serverPermission.lease
                    };
                case ServerPermissionSubmitResultStatus.IncorrectTokenState:
                    return {
                        error: new LicenseErrorResponse (
                            LicenseErrorType.IncorrectTokenState,
                            "Internal error (Incorrect token state)"
                        ),
                        lease: serverPermission.lease
                    };
            }
        }
    }
}
/* eslint-enable @typescript-eslint/no-explicit-any,
                 @typescript-eslint/explicit-module-boundary-types,
                 @typescript-eslint/no-unsafe-member-access,
                 @typescript-eslint/no-unsafe-call
*/
