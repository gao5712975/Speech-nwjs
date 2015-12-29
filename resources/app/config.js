'use strict';
var fs = require('fs');
var ini = require("ini");
var path = require('path');
var nwPath = process.execPath;
var nwDir = path.dirname(nwPath);

var logger = require('./resources/libs/logger').getLogger('config.js');
var utils = require('./resources/libs/utils');
var SDK = require('./resources/libs/play');
var child_process = require('./resources/libs/process');

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
    $loginUrl: $("#configureModal input[name=loginUrl]"),
    $userSource: $("#dataSourceModal input[name=userSource]"),
    $passwordSource: $("#dataSourceModal input[name=passwordSource]"),
    $addressSource: $("#dataSourceModal input[name=addressSource]"),
    $databaseSource: $("#dataSourceModal input[name=databaseSource]")
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
            c.sound.speed = "";
            c.sound.volume = "";
            c.sound.timbre = "";
            c.play = {};
            c.play.taskNumber = "";
            c.play.aheadTime = "";
            c.play.rulePlay = "";
            c.updateData = {};
            c.updateData.updateTime = "";
            c.login = {};
            c.login.user = "";
            c.login.password = "";
            c.urlConfig = {};
            c.urlConfig.dataUrl = "";
            c.urlConfig.loginUrl = "";
            fs.writeFile(nwDir + '/config.ini', ini.stringify(c), function (err) {
                if (err) throw err;
            });
        }
    })
};

var saveSoundConfig = function () {
    $("#saveSoundConfig").click(function (e) {
        e.preventDefault();
        var speed = config.$speed.val();
        var volume = config.$volume.val();
        var timbre = config.$timbre.val();
        SDK.speechConfig({speed: speed, volume: volume, timbre: timbre}, function (data) {
            logger.info(data);
        });
        var s = ini.parse(fs.readFileSync(nwDir + "/config.ini", "utf8"));
        if (s.sound == undefined) {
            s.sound = {};
        }
        s.sound.speed = speed;
        s.sound.volume = volume;
        s.sound.timbre = timbre;
        fs.writeFileSync(nwDir + "/config.ini", ini.stringify(s), {start: 0, flags: "w", encoding: "utf8"});
    });
};

var savePlayConfig = function () {
    $("#savePlayConfig").click(function (e) {
        e.preventDefault();
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
    $("#saveGetDataConfig").click(function (e) {
        e.preventDefault();
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
    $("#saveConfigureConfig").click(function (e) {
        e.preventDefault();
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
var viewDatabaseConfig = function () {
    var data = utils.properties.proRead(nwDir + "/system/tomcat/webapps/Speech/WEB-INF/classes/JDBC.properties");
    if (data != null) {
        $("#dataSourceModal input[name=userSource]").val(data.user);
        $("#dataSourceModal input[name=passwordSource]").val(data.password);
        $("#dataSourceModal input[name=addressSource]").val(data.addressSource);
        $("#dataSourceModal input[name=databaseSource]").val(data.databaseSource)
    }
};
var saveDatabaseConfig = function () {
    $("#saveDataSourceModal").click(function (e) {
        e.preventDefault();
        var userSource = $("#dataSourceModal input[name=userSource]").val();
        var passwordSource = $("#dataSourceModal input[name=passwordSource]").val();
        var addressSource = $("#dataSourceModal input[name=addressSource]").val();
        var databaseSource = $("#dataSourceModal input[name=databaseSource]").val();
        var data = utils.properties.proRead(nwDir + "/system/tomcat/webapps/Speech/WEB-INF/classes/JDBC.properties");
        data.addressSource = addressSource;
        data.databaseSource = databaseSource;
        data.jdbcUrl = "jdbc:oracle:thin:@(description=(address=(protocol=tcp)(port=1521)(host=" + addressSource + "))(connect_data=(service_name=" + databaseSource + ")))";
        data.user = userSource;
        data.password = passwordSource;
        utils.properties.proWrite(nwDir + "/system/tomcat/webapps/Speech/WEB-INF/classes/JDBC.properties", data);
    })
};

var restartServers = function () {
    $("#restartServers").click(function (e) {
        e.preventDefault();
        console.error("net stop Tomcat6");
        try {
            child_process.execFun("net stop Tomcat6");
            child_process.execFun("net start Tomcat6");
            child_process.execFun("sc config Tomcat6 start= auto");
            $(this).next().text("成功");
        } catch (e) {
            console.error("Tomcat6 " + e);
            try {
                child_process.execFun("net start Tomcat6");
                child_process.execFun("sc config Tomcat6 start= auto");
                $(this).next().text("成功");
            } catch (e) {
                console.error("Tomcat6 " + e);
                $(this).next().text("失败");
            }
        }
    })
};

var init = function () {
    viewConfig();
    saveSoundConfig();
    savePlayConfig();
    saveGetDataConfig();
    saveConfigureConfig();
    saveDatabaseConfig();
    restartServers();
    viewDatabaseConfig();
};

init();



