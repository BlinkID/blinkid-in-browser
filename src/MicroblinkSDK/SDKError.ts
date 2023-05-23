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

    constructor( error: { code: string; message: string }, details?: any )
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
        this.details = details;
    }
}
