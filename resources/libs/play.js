/**
 * Created by Yuan on 2015/11/17.
 */
'use strict';
var url = require("url");
var http = require("http");
var querystring = require("querystring");
var schedule = require("node-schedule");
var logger = require('./logger').getLogger('play.js');
var utils = require('./utils');
var TTS = require('./libokvtts');

/**
 *
 * @param dataStr {speech: rulePlay, taskNumber: number, id: id}
 * @param callback 返回状态码
 */
var speechPlay = function (dataStr, callback) {
    TTS.OKVPlay(dataStr.speech, dataStr.taskNumber, function (res) {
        callback(res);
    })
};

/**
 *
 * @param dataStr dataStr {speech: rulePlay, id: id, time: time, aheadTime: aheadTime, taskNumber: number}
 * @param callback 返回状态码
 * @statusPlay 0 :手动停止后或者没有开始播报  1:开始播报或者等待
 */
var play = function (dataStr, callback) {
    /*按提前时间播报班车信息*/
    var time = dataStr.time;
    var aheadTime = dataStr.aheadTime;
    if (aheadTime == "") {
        aheadTime = 0;
    }
    var nowTime = new Date();
    var year = parseInt(nowTime.getFullYear());
    var month = parseInt(nowTime.getMonth());
    var d = parseInt(nowTime.getDate());
    var h = parseInt(time.split(":")[0]);
    var m = parseInt(time.split(":")[1]);
    var date = new Date(year, month, d, h, m, 0);//将车次时间转换为标准时间

    if (new Date().getTime() >= (new Date(date.getTime() - parseInt(aheadTime) * 60 * 1000))) {
        TTS.OKVPlay(dataStr.speech, dataStr.taskNumber, function (res) {
            callback(res);
        })
    } else {
        global.timeout = schedule.scheduleJob(new Date(new Date().getTime() + 5000), function () {
            callback({status: 3});
        });
    }

};

var stop = function (callback) {
    TTS.OKVStop(function (res) {
        if (global.timeout) {
            global.timeout.cancel();
        }
        callback(res);
    })
};

var volumeConfig = function (data, callback) {
    TTS.OKVSetVolume(data, function (res) {
        callback(res);
    });
};

var speechConfig = function (data, callback) {
    TTS.OKVSetSpeed(data, function (res) {
        callback(res);
    });
};

var timbreConfig = function (data, callback) {
    TTS.OKVSetLangMode(data, function (res) {
        callback(res);
    });
};

module.exports = {
    speechPlay: speechPlay,
    play: play,
    stop: stop,
    volumeConfig: volumeConfig,
    speechConfig: speechConfig,
    timbreConfig: timbreConfig
};


