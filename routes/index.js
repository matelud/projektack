var express = require('express');
var router = express.Router();
var ssh = require('ssh-exec');

router.get('/', function (req, res, next) {
  ssh('hostname', req.session.sshconfig, function (err, stdout, stderr) {
    var hostname = stdout.trim();
    var resObj = {
      hostname: hostname,
      hostaddr: req.session.sshconfig.host
    };
    res.render('index', resObj);
  });
});

module.exports = router;