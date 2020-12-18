/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

/**
 * Returns safe path, i.e. URL for given path and filename (file path).
 *
 * @param path      String representing file path.
 * @param fileName  String representing file name.
 * @returns String representing URL for specified resource.
 */
export function getSafePath( path: string, fileName: string ): string
{
    // Since this function is called by Emscripten module, make sure to set default values
    path = path || "";
    fileName = fileName || "";

    if ( path === "" )
    {
        return fileName;
    }
    else if ( path.endsWith( "/" ) )
    {
        if ( fileName.startsWith( "/" ) )
        {
            return path + fileName.substring( 1 );
        }
        else
        {
            return path + fileName;
        }
    }
    else if ( fileName.startsWith( "/" ) )
    {
        return path + fileName;
    }
    else
    {
        return path + "/" + fileName;
    }
}
