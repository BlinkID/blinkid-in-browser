/*! ****************************************************************************
Copyright (c) Microblink. All rights reserved.

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.
***************************************************************************** */
(function () {
'use strict';

/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 *
 * The purpose of this file is to make sure that it's possible to load external
 * worker script file in the current environment.
 *
 * See comment in `WasmLoadUtils.ts` file for more information.
 */

onmessage = function ()
{
    this.postMessage( 1 );
};

}());
