var readKeyValue = require('./parse');
var ssh = require('ssh-exec');
module.exports = {
    net: function(netdev, callback){
        netdev = netdev.trim().split( "\n" );
        netdev.shift(); netdev.shift();
        var r = [];
        for(dev in netdev){
            line = netdev[dev].trim().match( /\S+/g );

            r.push({
                device: line[0].substr(0, line[0].length - 1),
                Rx: {
                    bytes: line[1],
                    packets: line[2]
                },
                Tx: {
                    bytes: line[9],
                    packets: line[10]
                }
            });
        }
        return callback(r);
    },
    netdev: function(devName, req, callback){
        ssh('ifconfig '+devName, req.session.sshconfig, function (err, ifconfdev) {
            var r = {};
            var link = ""+ifconfdev.match(/Link encap:[\S]+/);
            var hwaddr = ""+ifconfdev.match(/HWaddr [\S]+/);
            var inetaddr = ""+ifconfdev.match(/inet addr:[\S]+/);
            var bcast = ""+ifconfdev.match(/Bcast:[\S]+/);
            var mask = ""+ifconfdev.match(/Mask:[\S]+/);
            var mtu = ""+ifconfdev.match(/MTU:[\S]+/);
            var scope = ""+ifconfdev.match(/Scope:[\S]+/);
            var metric = ""+ifconfdev.match(/Metric:[\S]+/);
            var up = ifconfdev.match(/UP/);
            if(up != null){
                up = true;
            }else{
                up = false;
            }
            r.nic = ""+ifconfdev.match(/(eth[\d]+)|(wlan[\d]+)/g);
            r.link = readKeyValue(link).link_encap;
            r.hwaddr = readKeyValue(hwaddr.split(':').join('-').replace("HWaddr ",'HWaddr:')).hwaddr;
            r.inetaddr = readKeyValue(inetaddr).inet_addr;
            r.bcast = readKeyValue(bcast).bcast;
            r.mask = readKeyValue(mask).mask;
            r.mtu = readKeyValue(mtu).mtu;
            r.scope = readKeyValue(scope).scope;
            r.metric = readKeyValue(metric).metric;
            r.isup = up;
            return callback(r);
        });
    },
    getDev: function(ifconfig, callback){
        var regex = /(wlan[\d])|(eth[\d])|(lo)/g;
        var ret = [];
        var m;
        if(regex.global){
            while (m = regex.exec(ifconfig)){
                ret.push(m[0]);
            }
        }else{
            if(m = regex.exec(ifconfig)){
                ret.push(m[0]);
            }
        }
        return callback(ret);
    },
    //wlan: function(wifidev, callback){
    //    wifidev = wifidev.trim().split( "\n" );
    //    var result = [];
    //    var ssid = '';
    //    var wlan = {};
    //    for(var dev in wifidev){
    //        var line = wifidev[dev];
    //        if(dev== 0) {
    //            first = line;
    //            continue;
    //        }
    //        line = line.split(/ [ ]+/);
    //        ssid = line[0].trim().substr(1,line[0].length-2);
    //
    //        wlan.SSID = ssid;
    //        wlan.BSSID = line[1];
    //        wlan.MODE = line[2];
    //        wlan.FREQ = line[3];
    //        wlan.RATE = line[4];
    //        wlan.SIGNAL = line[5];
    //        wlan.SECURITY = line[6];
    //        wlan.ACTIVE = line[7];
    //        ssid = ssid.replace(new RegExp(' ', 'g'), '');
    //        console.log(ssid);
    //        if(result[ssid] != undefined){
    //            result[ssid][result[ssid].length] = wlan;
    //        }else{
    //            result[ssid] = [wlan];
    //        }
    //    }
    //    //if(!result.length){
    //    //    return callback(JSON.parse('{"err": "1"}'));
    //    //}
    //    return callback(result);
    //}
    wlan: function(wifidev, callback){
        wifidev = wifidev.trim().split( "\n" );
        var result = "[";
        for(dev in wifidev){
            line = wifidev[dev];
            if(dev== 0) {
                first = line;
                continue;
            }
            line = line.split(/ [ ]+/);
            result = result + '{"SSID":"'+line[0].trim().substr(1,line[0].length-2)+'", "BSSID":"'+line[1]+'", "MODE":"'+line[2]+
                '", "FREQ":"'+line[3]+'", "RATE":"'+line[4]+'","SIGNAL":"'+line[5]+'","SECURITY":"'+line[6]+'","ACTIVE":"'+line[7]+'"},';
        }
        //if(result.length <5){
        //    return callback(JSON.parse('{"err": "1"}'));
        //}
        //return callback(JSON.parse(""+result.substr(0,result.length-1)+"]"));
        var dane = JSON.parse(""+result.substr(0,result.length-1)+"]");
        var ret = {};
        var oneWlan = '';
        dane.forEach(function (item, i) {
            oneWlan = item.SSID.replace(new RegExp(' ', 'g'), '');
            if(ret[oneWlan] != undefined){
                ret[oneWlan][ret[oneWlan].length] = item;
            }else{
                ret[oneWlan] = [item];
            }
            if(i === dane.length - 1){
                return callback(ret);
            }
        });
    }
};