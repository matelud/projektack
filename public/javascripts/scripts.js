$(document).ready(function(){
    setTimeout(function(){
        if(location.pathname != '/login') {
            getCpuData();
            getMemData();
            getNetDevices();
            getHdd();
            wifi();
            getUsb();
            setInterval(function () {
                getMemData();
            }, 2000);
        }
    }, 1000);
    $('#mounted-tab').tab('show');
});

var jqpltOpt = {
    grid: {
        drawBorder: false,
        drawGridlines: false,
        background: 'transparent',
        shadow: false
    },
    seriesDefaults:{
        renderer: $.jqplot.PieRenderer,
        rendererOptions: {
            showDataLabels: true
        }
    },
    legend:{ show:false }
};

function getCpuData(){
    $.ajax({
        url: '/getdata/cpu',
        method: 'GET',
        success: function(data){
            if(data.length) {
                var cpu = data[0];
                var threads = data.length;
                $('.cpu-vendor-id h4 span').html(cpu.vendor_id);
                $('.cpu-model-name h4 span').html(cpu.model_name);
                $('.cpu-gen h4 span').html(cpu.cpu_family);
                $('.cpu-cores h4 span').html(cpu.cpu_cores);
                $('.cpu-threads h4 span').html(threads);
                $('.cpu-cache-size h4 span').html(convert(cpu.cache_size));
            }else{
                getCpuData();
            }
        }
    });
}

function getMemData(){
    $.ajax({
        url: '/getdata/mem',
        method: 'GET',
        success: function (data) {
            $('.mem-total h4 span').html(convert(data.memtotal));
            $('.mem-free h4 span').html(convert(data.memfree));
            var inUse =  $('.mem-in-use h4');
            inUse.find('.val').html(convert(data.meminuse)+' ');
            inUse.find('.procent').html(data.memuseperc + '%');
            var chart = $('.data-memory-chart');
            chart.find('.nofill').css('height', 100 - data.memuseperc + '%');
            chart.find('.fill').css('height', data.memuseperc + '%');
            chart.find('.perc').html(data.memuseperc + '%');
        }
    });
}

function getNetDevices(){
    $.ajax({
        url: '/getdata/netdev/getdev/1',
        method: 'GET',
        success: function (devArrayNames) {
            if(devArrayNames.length) {
                getNetDevData(devArrayNames);
            }else{
                getNetDevices();
            }
        }
    })
}

var netDevCount = 0;
function getNetDevData(devArrayNames){
    $.each(devArrayNames, function (i, dev) {
        $.ajax({
            url: '/getdata/netdev/info/'+dev,
            method: 'GET',
            success: function (netDevInfo) {
                if($('[data-nic="'+netDevInfo+'"]').length){
                    console.log(netDevInfo);
                }else {
                    if (netDevInfo.nic != 'null') {
                        netDevCount++;
                        addNetDev(netDevInfo);
                    } else if (netDevCount < 1) {
                        getNetDevices();
                    }
                }
            }
        })
    });
    refreshNetData();
}

function addNetDev(devData){
    var id = randomID();
    var badge = 'OFF';
    if(devData.isup){
        badge = 'ON';
    }
    var nav = '<li><a href="#'+id+'" role="tab" data-toggle="tab">'+devData.nic+'<span class="badge">'+badge+'</span></a></li>';
    var div1 = '<div class="tab-pane" id="'+id+'" data-nic="'+devData.nic+'"><div class="col-md-6">';
    var typ = '<h4><small>typ</small><span>'+devData.link+'</span></h4>';
    var mac = '<h4><small>adres MAC</small><span>'+devData.hwaddr+'</span></h4>';
    var adres = '<h4><small>adres</small><span>'+devData.inetaddr+'</span></h4>';
    var maska = '<h4><small>maska</small><span>'+devData.mask+'</span></h4>';
    var bcast = '<h4><small>broadcast</small><span>'+devData.bcast+'</span></h4>';
    var mtu = '<h4><small>MTU</small><span>'+devData.mtu+'</span></h4>';
    var div2 = '</div><div class="col-md-6">';
    var transfer = '<h4>Transfer</h4><h4 class="rx"><small>odebrane</small><span></span></h4><h4 class="tx"><small>wysłane</small><span></span></h4>';
    var pakiety = '<h4>Pakiety</h4><h4 class="pak-rx"><small>odebrane</small><span></span></h4><h4 class="pak-tx"><small>wysłane</small><span></span></h4>';
    var div3 = '</div></div>';

    $('.network ul').append(nav);
    $('.network .tab-content').append((div1+typ+mac+adres+maska+bcast+mtu+div2+transfer+pakiety+div3).split('undefined').join('-'));

    $('.nav-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
}

function refreshNetData(){
    $.ajax({
        url: '/getdata/net',
        method: 'GET',
        success: function (data) {
            $.each(data, function (i, item) {
                var sel = $('[data-nic="'+item.device+'"]');
                if(sel.length){
                    sel.find('.rx span').html(convert(item.Rx.bytes));
                    sel.find('.tx span').html(convert(item.Tx.bytes));
                    sel.find('.pak-rx span').html(item.Rx.packets);
                    sel.find('.pak-tx span').html(item.Tx.packets);
                }
            });
            setTimeout(function () {
                refreshNetData();
            }, 2000);
        }
    });
}

function getHdd(type){
    if(type == undefined || type == 1) {
        $.ajax({
            url: '/getdata/hdd',
            method: 'GET',
            success: function (data) {
                if (data.length) {
                    $.each(data, function (i, item) {
                        var id = randomID();
                        var div1 = '<div class="col-md-6"><div class="col-md-6">';
                        var part1 = '<h1><span>' + item.mounted + '</span></h1>';
                        var part2 = '<h4><small>system plików</small><span>' + item.filesystem + '</span>';
                        var part3 = '<h4><small>wielkość</small><span>' + item.size + '</span>';
                        var part4 = '<h4><small>wykorzystane</small><span>' + item.used + '</span>';
                        var part5 = '<h4><small>wolne</small><span>' + item.avail + '</span>';
                        var div2 = '</div><div class="col-md-6"><div class="hdd-chart" id="' + id + '"></div></div></div></div>';
                        var perc1 = parseInt(item.useperc.replace('%', ''));
                        var perc2 = 100 - perc1;
                        $('.data-hdd').append(div1 + part1 + part2 + part3 + part4 + part5 + div2);
                        $.jqplot(id, [[['wolne', perc1], ['reszta', perc2]]], jqpltOpt);
                    });
                } else {
                    getHdd(1);
                }
            }
        });
    }
    if(type == undefined || type == 2) {
        $.ajax({
            url: '/getdata/hdd/fdisk',
            method: 'GET',
            success: function (data) {
                if (data.length) {
                    $.each(data, function (i, item) {
                        var div1 = '<div class="col-md-6">';
                        var part1 = '<h1><span>' + item.device + '</span></h1>';
                        var part2 = '<h4><small>liczba sektorów</small><span>' + item.sectors + '</span>';
                        var part3 = '<h4><small>typ</small><span>' + item.type + '</span>';
                        var part4 = '<h4><small>wielkość</small><span>' + item.size + '</span>';
                        var div2 = '</div>';
                        $('.data-fdisk').append(div1 + part1 + part2 + part3 + part4 + div2);
                    });
                } else {
                    getHdd(2);
                }
            }
        });
    }
}

var wifiOut = 0;
function wifi(){
    $.ajax({
        url: '/getdata/wlan',
        method: 'GET',
        success: function (data) {
            if(data.err == 1){
                wifiOut++;
                if(wifiOut < 5) {
                    wifi();
                }
            }else{
                var sel = $('.data-presentation');
                var div1 = '<div class="col-md-12"><div class="panel panel-primary"><div class="panel-heading"><h3 class="panel-title">Dostępne sieci WiFi</h3></div><div class="panel-body">';
                var div2 = '</div></div></div>';
                var table1 = '<table class="table"><thead><tr><th colspan="5">SSID</th></tr></thead>';
                var table2 = '</table>';
                var tr = '';
                var color = '';
                $.each(data, function (i, wlan) {
                    tr += '<tr class="ssid-parent" data-ssid="'+wlan[0].SSID+'"><td colspan="5">' + wlan[0].SSID + '</td></tr>';
                    $.each(wlan, function (i, item) {
                        color = '';
                        if(item.ACTIVE == 'yes'){
                            color = ' success';
                        }
                        tr += '<tr class="ssid-child'+color+'" data-ssid="'+wlan[0].SSID+'">';
                        tr += '<td><small>MAC AP</small> ' + item.BSSID + '</td>';
                        tr += '<td><small>częstotliwość</small> ' + item.FREQ + '</td>';
                        tr += '<td><small>prędkość</small> ' + item.RATE + '</td>';
                        tr += '<td><small>typ zabezpieczeń</small> ' + item.SECURITY + '</td>';
                        tr += '<td><small>siła sygnału</small> ' + item.SIGNAL + '</td>';
                        tr += '</tr>';
                    });
                });
                sel.append(div1+table1+tr+table2+div2);
                var sel2 = $('.ssid-child.success');
                if(sel2.length){
                    var ssid = sel2.attr('data-ssid');
                    var par = $('.ssid-parent[data-ssid="'+ssid+'"]');
                    par.addClass('success');
                    var text = par.find('td').html()
                    par.find('td').html(text + ' -  <small>jesteś połączony z tą siecią</small>');
                }
                $('.ssid-parent').click(function () {
                    var id = $(this).attr('data-ssid');
                    var sel = $('.ssid-child[data-ssid="'+id+'"]');
                    var vis = sel.is(':visible');
                    if(vis){
                        sel.hide();
                    }else{
                        sel.show();
                    }
                });
            }
        }
    });
}

var usbOK = 0;
function getUsb(){
    $.ajax({
        url: '/getdata/usb',
        method: 'GET',
        success: function(data){
            if(data.length){
                var sel = $('.data-presentation');
                var div1 = '<div class="col-md-12"><div class="panel panel-primary"><div class="panel-heading"><h3 class="panel-title">Podłączone urządzenia USB</h3></div><div class="panel-body">';
                var div2 = '</div></div></div>';
                var table1 = '<table class="table"><tr><th>Urządzenie</th><th>Numer</th><th>Identyfikator</th><th>Szyna</th></tr>';
                var table2 = '</table>';
                var tr = '';
                $.each(data, function (i, item) {
                    tr += '<tr><td>'+item.info+'</td><td>'+item.device+'</td><td>'+item.id+'</td><td>'+item.bus+'</td></tr>'
                });
                sel.append(div1+table1+tr+table2+div2);
            }else{
                if(usbOK < 5){
                    usbOK++;
                    getUsb();
                }
            }
        }
    })
}

function randomID(){
    var ret = '';
    for (i=0; i<6; i++) {
        var cyfra = Math.floor(Math.random() * 10);
        ret += cyfra.toString();
    }
    return ret;
}

function convert(num){
    var exponent;
    var unit;
    var neg = num < 0;
    var units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    if (neg) {
        num = -num;
    }
    if (num < 1) {
        return (neg ? '-' : '') + num + ' B';
    }
    exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
    num = Number((num / Math.pow(1000, exponent)).toFixed(2));
    unit = units[exponent];
    return (neg ? '-' : '') + num + ' ' + unit;
}