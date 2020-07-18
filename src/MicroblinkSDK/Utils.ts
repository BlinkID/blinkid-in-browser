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
    if ( path.endsWith( "/" ) )
    {
        if ( fileName.startsWith( "/" ) )
        {
            return path + fileName.substring( 1 );
        }
        return path + fileName;
    }
    if ( fileName.startsWith( "/" ) )
    {
        return path + fileName;
    }
    return path + "/" + fileName;
}
