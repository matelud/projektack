var readKeyValue = require('./parse');
module.exports = function(data, callback) {
    var procs = data.split("\n\n");
    var r = [];
    for(p in procs){
        if (procs[p].length < 1) continue;
        r.push(readKeyValue(procs[p]));
    }
    return callback(r);
};