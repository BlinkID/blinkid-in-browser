export function convertEmscriptenStatusToProgress( emStatus: string ): number
{
    // roughly based on https://github.com/emscripten-core/emscripten/blob/1.39.11/src/shell.html#L1259
    if ( emStatus == 'Running...' )
    {
        // download has completed, wasm execution has started
        return 100;
    }
    else if ( emStatus.length == 0 )
    {
        // empty message
        return 0;
    }

    const match = emStatus.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
    if ( match )
    {
        const currentValue = parseInt( match[ 2 ] );
        const maxValue = parseInt( match[ 4 ] );
        return currentValue * 100 / maxValue;
    }
    else
    {
        // some other message
        console.debug( "Cannot parse emscripten status: ", emStatus );
        return NaN;
    }
}
