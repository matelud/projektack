module.exports = function(usbdev, callback){
    var devicedev = usbdev.split("\n");
    var result ="[";
    for (var dev in devicedev) {
        var line = devicedev[dev];
        var bus = line.match(/Bus [0-9]{3}/);
        var device =line.match(/Device [0-9]{3}/);
        var id = ""+line.match(/ID [\S]+/);
        var info = line.substr(line.lastIndexOf(id) + id.length);
        if(bus!=null)
            result = result + '{"bus":"'+bus+'", "device":"'+device+'", "id":"'+id+'", "info":"'+info+'"},';
    }
    return callback(JSON.parse(""+result.substr(0,result.length-1)+"]"));
};