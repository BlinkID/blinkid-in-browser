/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/* eslint-disable @typescript-eslint/no-explicit-any,
                  @typescript-eslint/no-unsafe-assignment */

export class SDKError extends Error
{
    code: string;

    message: string;

    details?: any;

    constructor( error: { code: string; message: string } | SerializableSDKError, details?: any )
    {
        super();

        if ( !error.code || !error.message )
        {
            throw new Error(
                "Instance of SDKError is required to have code and message."
            );
        }

        this.message = error.message;
        this.code = error.code;

        if ( error instanceof SerializableSDKError && error.details && "message" in error.details )
        {
            const errorObj = new Error( ( error.details as CustomError ).message );

            if ( "stack" in error.details )
            {
                errorObj.stack = ( error.details as CustomError ).stack;
            }

            this.details = errorObj;
        }
        else
        {
            this.details = details;
        }
    }
}

export class SerializableSDKError
{
    code: string;

    message: string;

    details?: any;

    constructor( error: { code: string; message: string }, details?: any )
    {
        if ( !error.code || !error.message )
        {
            throw new Error(
                "Instance of SDKError is required to have code and message."
            );
        }

        this.message = error.message;
        this.code = error.code;

        if ( details instanceof Error )
        {
            this.details = new CustomError( details );
        }
        else
        {
            this.details = details;
        }
    }
}

class CustomError
{
    name: string;

    message: string;

    stack: string | undefined;

    constructor( error: Error )
    {
        this.message = error.message;
        this.name = error.name;
        this.stack = error.stack;
    }
}
