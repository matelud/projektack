var readKeyValue = require('./parse');
module.exports = function(data, callback) {
    data = readKeyValue( data );
    return callback(data);
};