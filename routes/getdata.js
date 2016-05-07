var express = require('express');
var router = express.Router();

var ssh = require('ssh-exec');
var cpuInfoTool = require('../functions/cpuinfo');
var memInfoTool = require('../functions/meminfo');
var uptimeTool = require('../functions/uptime');
var netTool = require('../functions/net');
var hddTool = require('../functions/hdd');
var usbTool = require('../functions/usbdev');


router.get('/cpu', function(req, res, next) {
    ssh('cat /proc/cpuinfo', req.session.sshconfig, function (err, stdout, stderr) {
        cpuInfoTool(stdout, function (result) {
            res.json(result);
        });
    });
});

router.get('/mem', function (req, res, next) {
    ssh('cat /proc/meminfo | grep "MemFree\\\|MemTotal"', req.session.sshconfig, function (err, stdout, stderr) {
        memInfoTool(stdout, function (result) {
            result.meminuse = result.memtotal - result.memfree;
            result.memuseperc = Math.round((result.meminuse / result.memtotal) * 100);
            res.json(result);
        })
    });
});

router.get('/usb', function (req, res, next) {
    ssh('lsusb', req.session.sshconfig, function (err, stdout, stderr) {
        usbTool(stdout, function (result) {
            res.json(result);
        });
    });
});

router.get('/net', function(req, res, next) {
    ssh('cat /proc/net/dev', req.session.sshconfig, function (err, stdout, stderr) {
        netTool.net(stdout, function (result) {
            res.json(result);
        });
    });
});

router.get('/netdev/:type/:val', function (req, res, next) {
    if(req.params.type == 'getdev'){
        ssh('ifconfig', req.session.sshconfig, function (err, stdout, stderr) {
            netTool.getDev(stdout, function (result) {
                res.json(result);
            });
        });
    }else{
        var nic = req.params.val;
        if(!nic){
            nic = 'eth0';
        }
        netTool.netdev(nic, req, function (result) {
            res.json(result);
        });
    }
});

router.get('/wlan', function (req, res, next) {
    ssh('sudo nmcli dev wifi', req.session.sshconfig, function (err, stdout, stderr) {
        netTool.wlan(stdout, function (result) {
            res.json(result);
        });
    });
});

router.get('/hdd', function (req, res, next) {
    ssh('df -h', req.session.sshconfig, function (err, stdout, stderr) {
        hddTool.mounted(stdout, function (result) {
            res.json(result);
        });
    });
});

router.get('/hdd/fdisk', function (req, res, next) {
    ssh('sudo fdisk -l', req.session.sshconfig, function (err, stdout, stderr) {
        hddTool.fdisk(stdout, function (result) {
            res.json(result);
        })
    });
});

router.get('/uptime', function(req, res, next) {
    ssh('cat /proc/uptime', req.session.sshconfig, function (err, stdout, stderr) {
        uptimeTool.getTime(stdout, function (uptime, startTime) {
            res.json({starttime: uptimeTool.parseTime(startTime, 1)});
        });
    });
});

router.post('/other', function (req, res, next) {
    ssh(req.body.post, req.session.sshconfig, function (err, stdout, stderr) {
        console.log(stderr);
        console.log(stdout);
        res.send(stdout);
    });
});

module.exports = router;