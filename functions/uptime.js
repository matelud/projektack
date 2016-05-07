module.exports = {
    getTime: function(uptime, callback) {
        uptime = uptime.split(' ');
        uptime = parseInt(uptime[0].split('.')[0]);
        var startTime = Math.floor(new Date().getTime() / 1000) - uptime;
        return callback(uptime, startTime);
    },
    parseTime: function (time, format) {
        time = new Date(time * 1000);
        var day = "0" + time.getDay();
        var month = "0" + time.getMonth();
        var year = time.getFullYear();
        var hours = "0" + time.getHours();
        var minutes = "0" + time.getMinutes();
        var seconds = "0" + time.getSeconds();
        if(format){
            return day.substr(-2) + '.' + month.substr(-2) + '.' + year + ' - ' + hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        }
        day = time/60/60/24;
        hours = "0" + time/60/60%24;
        minutes = "0" + time/60%60;
        seconds = "0" + time%60;
        return day + 'd ' + hours.substr(-2) + 'g ' + minutes.substr(-2) + 'm ' + seconds.substr(-2) + 's';
    }
};