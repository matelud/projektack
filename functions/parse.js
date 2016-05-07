module.exports = function readKeyValue( input, sep ) {
    if ( !sep ) sep = ":";
    input = input.trim().split( "\n" );
    var r = {};
    for(key in input ){
        line = input[ key ].trim().split( sep );
        if ( line.length != 2 ) continue;
        line[0] = line[0].trim().replace(' ', '_').toLowerCase();
        line[1] = line[1].trim();
        if ( line[1].slice( -3 ) == ' kB' || line[1].slice( -3 ) == ' KB' )
            line[1] = parseInt( line[1].substr( 0, line[1].length -3 ) ) * 1024;
        r[ line[0] ] = line[1];
    }
    return r;
};