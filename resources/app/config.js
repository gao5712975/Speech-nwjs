'use strict';
var fs = require('fs');
var ini = require("ini");
var path = require('path');
var nwPath = process.execPath;
var nwDir = path.dirname(nwPath);

var logger = require('./resources/libs/logger').getLogger('config.js');
var utils = require('./resources/libs/utils');
var SDK = require('./resources/libs/play');

var config = {
    $speed: $("#soundModal input[name=speed]"),
    $volume: $("#soundModal input[name=volume]"),
    $timbre: $("#soundModal select[name=timbre]"),
    $taskNumber: $("#playModal input[name=taskNumber]"),
    $aheadTime: $("#playModal input[name=aheadTime]"),
    $rulePlay: $("#playModal input[name=rulePlay]"),
    $updateTime: $("#getDataModal input[name=updateTime]"),
    $user: $("#loginModal input[name=user]"),
    $password: $("#loginModal input[name=password]"),
    $dataUrl: $("#configureModal input[name=dataUrl]"),
    $loginUrl: $("#configureModal input[name=loginUrl]")
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
            config.$loginUrl.val(data.urlConfig.loginUrl);
            global.dataUrl = data.urlConfig.dataUrl;
            global.loginUrl = data.urlConfig.loginUrl;
        } else {
            var c = {};
            c.scope = "local";
            c.sound = {};
            c.sound.speed = "";c.sound.volume = "";c.sound.timbre = "";
            c.play = {};
            c.play.taskNumber = "";c.play.aheadTime = "";c.play.rulePlay = "";
            c.updateData = {};
            c.updateData.updateTime = "";
            c.login = {};
            c.login.user = "";c.login.password = "";
            c.urlConfig = {};
            c.urlConfig.dataUrl = "";c.urlConfig.loginUrl = "";
            fs.writeFile(nwDir + '/config.ini', ini.stringify(c), function (err) {
                if (err) throw err;
            });
        }
    })
};

var saveSoundConfig = function () {
    $("#saveSoundConfig").click(function () {
        var speed = config.$speed.val();
        var volume = config.$volume.val();
        var timbre = config.$timbre.val();
        var s = ini.parse(fs.readFileSync(nwDir + "/config.ini", "utf8"));
        if (s.sound == undefined) {
            s.sound = {};
        }
        if (s.sound.speed != speed) {
            SDK.speechConfig(s.sound.speed, function (data) {
                logger.info(data);
            });
        }
        if (s.sound.volume != volume) {
            SDK.volumeConfig(s.sound.volume, function (data) {
                logger.info(data);
            });
        }
        if (s.sound.timbre != timbre) {
            SDK.timbreConfig(s.sound.timbre, function (data) {
                logger.info(data);
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
        var loginUrl = config.$loginUrl.val();
        var l = ini.parse(fs.readFileSync(nwDir + "/config.ini", "utf8"));
        if (l.urlConfig == undefined) {
            l.urlConfig = {};
        }
        if (l.urlConfig.dataUrl != dataUrl) {
            global.dataUrl = dataUrl;
        }
        if (l.urlConfig.loginUrl != loginUrl) {
            global.loginUrl = loginUrl;
        }
        l.urlConfig.dataUrl = dataUrl;
        l.urlConfig.loginUrl = loginUrl;
        fs.writeFileSync(nwDir + "/config.ini", ini.stringify(l), {start: 0, flags: "w", encoding: "utf8"});

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

