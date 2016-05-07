var express = require('express');
var router = express.Router();
var ssh = require('ssh-exec');

router.get('/', function(req, res, next){
    res.render('sshlogin');
});

router.post('/', function (req, res, next) {
    if(req.body.host != '' && req.body.port > 0 && req.body.user != ''){
        req.session.sshconfig = {
            host: req.body.host,
            port: req.body.port,
            user: req.body.user,
            password: req.body.password
        };
        ssh('ls', req.session.sshconfig, function (err, stdout, stderr) {
            if(err || stderr){
                console.log(stderr);
                req.flash('danger', 'Wystąpił błąd, sprawdź poprawność danych');
                res.redirect('/login');
            }else{
                req.session.zalogowany = 1;
                res.redirect('/');
            }
        });

    }else{
        req.flash('danger', 'Nie podano adresu hosta, numeru portu lub nazwy użytkownika');
        res.redirect('/login');
    }
});

router.get('/logout', function (req, res, next) {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

module.exports = router;
