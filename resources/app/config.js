'use strict';
var fs = require('fs');
var ini = require("ini");
var path = require('path');
var nwPath = process.execPath;
var nwDir = path.dirname(nwPath);
var gui = require('nw.gui');
var win = gui.Window.get();
var TTS = require('./resources/libs/libokvtts');
win.on('close', function() {
    TTS.libokvtts.OKVUnInit.async(null,function (err,res) {
        if(res == 0){
            this.hide();
        }
    })
});

var logger = require('./resources/libs/logger').getLogger('config.js');
var utils = require('./resources/libs/utils');
var SDK = require('./resources/libs/play');

global.dataUrl = "http://127.0.0.1:3001/Speech";//发布地址

var config = {
    $speed: $("#soundModal input[name=speed]"),
    $volume: $("#soundModal input[name=volume]"),
    $timbre: $("#soundModal input[name=timbre]"),
    $taskNumber: $("#playModal input[name=taskNumber]"),
    $aheadTime: $("#playModal input[name=aheadTime]"),
    $rulePlay: $("#playModal input[name=rulePlay]"),
    $updateTime: $("#getDataModal input[name=updateTime]"),
    $user: $("#loginModal input[name=user]"),
    $password: $("#loginModal input[name=password]"),
    $dataUrl: $("#configureModal input[name=dataUrl]")
};

var viewConfig = function () {
    fs.exists(nwDir + '/config.ini', function (exists) {
        if (exists) {
            var data = ini.parse(fs.readFileSync(nwDir + "/config.ini", "utf8"));
            config.$speed.val(data.sound.speed);
            config.$volume.val(data.sound.volume);
            config.$timbre.val(data.sound.timbre);
            config.$taskNumber.val(data.play.taskNumber);
            config.$aheadTime.val(data.play.aheadTime);
            config.$rulePlay.val(data.play.rulePlay);
            config.$updateTime.val(data.updateData.updateTime);
            config.$user.val(data.login.user);
            config.$password.val(data.login.password);
            config.$dataUrl.val(data.urlConfig.dataUrl);

            global.dataUrl = data.urlConfig.dataUrl;
        } else {
            fs.createWriteStream(nwDir + '/config.ini', {start: 0, flags: "w", encoding: "utf8"});
            var c = ini.parse(fs.readFileSync(nwDir + "/config.ini", "utf8"));
            c.scope = "local";
            fs.writeFileSync(nwDir + "/config.ini", ini.stringify(c));
        }
    })
};

var saveSoundConfig = function () {
    $("#saveSoundConfig").click(function () {
        console.info(config.$speed.val());
        var speed = config.$speed.val();
        var volume = config.$volume.val();
        var timbre = config.$timbre.val();
        var s = ini.parse(fs.readFileSync(nwDir + "/config.ini", "utf8"));
        if (s.sound == undefined) {
            s.sound = {};
        }
        if(s.sound.speed != speed){
            SDK.speechConfig(s.sound.speed, function (data) {
                logger.info(speed);
            });
        }
        if(s.sound.volume != volume){
            SDK.volumeConfig(s.sound.volume, function (data) {
                logger.info(volume);
            });
        }
        if(s.sound.timbre != timbre){
            SDK.timbreConfig(s.sound.timbre, function (data) {
                logger.info(timbre);
            });
        }
        s.sound.speed = speed;
        s.sound.volume = volume;
        s.sound.timbre = timbre;
        fs.writeFileSync(nwDir + "/config.ini", ini.stringify(s), {start: 0, flags: "w", encoding: "utf8"});
    });
};

var savePlayConfig = function () {
    $("#savePlayConfig").click(function () {
        var taskNumber = config.$taskNumber.val();
        var aheadTime = config.$aheadTime.val();
        var rulePlay = config.$rulePlay.val();

        var p = ini.parse(fs.readFileSync(nwDir + "/config.ini", "utf8"));
        if (p.play == undefined) {
            p.play = {};
        }
        var oldTaskNumber = p.play.taskNumber;

        p.play.taskNumber = taskNumber;
        p.play.aheadTime = aheadTime;
        p.play.rulePlay = rulePlay;
        fs.writeFileSync(nwDir + "/config.ini", ini.stringify(p), {start: 0, flags: "w", encoding: "utf8"});
        if (oldTaskNumber != taskNumber) {
            utils.viewTable();
        }
    });
};

var saveGetDataConfig = function () {
    $("#saveGetDataConfig").click(function () {
        var updateTime = config.$updateTime.val();
        var d = ini.parse(fs.readFileSync(nwDir + "/config.ini", "utf8"));
        if (d.updateData == undefined) {
            d.updateData = {};
        }
        d.updateData.updateTime = updateTime;
        fs.writeFileSync(nwDir + "/config.ini", ini.stringify(d), {start: 0, flags: "w", encoding: "utf8"});
    });
};


var saveConfigureConfig = function () {
    $("#saveConfigureConfig").click(function () {
        var dataUrl = config.$dataUrl.val();
        var l = ini.parse(fs.readFileSync(nwDir + "/config.ini", "utf8"));
        if (l.urlConfig == undefined) {
            l.urlConfig = {};
        }
        var oldDataUrl = l.urlConfig.dataUrl;
        l.urlConfig.dataUrl = dataUrl;
        fs.writeFileSync(nwDir + "/config.ini", ini.stringify(l), {start: 0, flags: "w", encoding: "utf8"});
        if (oldDataUrl != dataUrl) {
            global.dataUrl = dataUrl;
        }
    });
};

var init = function () {
    viewConfig();
    saveSoundConfig();
    savePlayConfig();
    saveGetDataConfig();
    saveConfigureConfig();
};

init();

