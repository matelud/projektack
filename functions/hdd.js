module.exports = {
    mounted: function(partdev, callback){
        partdev = partdev.trim().split( "\n" );
        var result = [];
        var dev = {};
        partdev.forEach(function (line, i) {
            line = line.split(/[ ]+/);
            if(i == 0){
                return;
            }
            dev = {
                filesystem: line[0],
                size: line[1],
                used: line[2],
                avail: line[3],
                useperc: line[4],
                mounted: line[5]
            };
            result.push(dev);
        });
        return callback(result);
    },
    fdisk: function(disk, callback){
        var devicedev = disk.split("\n\n");
        devicedev = devicedev[1];
        var details = devicedev.trim().split("\n");
        var result ="[";
        for (dev in details){
            if(dev==0) continue;
            var items = details[dev].trim().split(/[ ]+/);
            if(items.length == 8){
                result = result + '{"device":"'+items[0]+'", "boot":true, "start":"'+items[2]+'", "end":"'+items[3]+'", "sectors":"'+items[4]+'", "size":"'+items[5]+'", "id":"'+items[6]+'",'+' "type":"'+items[7]+'"},';
            }
            else{
                result = result + '{"device":"'+items[0]+'", "boot":false, "start":"'+items[1]+'", "end":"'+items[2]+'", "sectors":"'+items[3]+'", "size":"'+items[4]+'", "id":"'+items[5]+'",'+' "type":"'+items[6]+'"},';
            }
        }
        return callback(JSON.parse(""+result.substr(0,result.length-1)+"]"));
    }
};