/**
 * Created by Yuan on 2015/11/17.
 */
'use strict';
var url = require("url");
var http = require("http");
var querystring = require("querystring");
var schedule = require("node-schedule");
var logger = require('./logger').getLogger('play.js');
var urlStr = "http://127.0.0.1:3001/Speech/admin/";
/**
 *
 * @param dataStr {speech: rulePlay, taskNumber: number, id: id}
 * @param callback 返回状态码
 */
var speechPlay = function (dataStr, callback) {
    var optUrl = url.parse(urlStr + "play.do");
    optUrl.method = "post";
    optUrl.headers = {"Content-Type": 'application/x-www-form-urlencoded'};
    var postData = "";
    var manage = http.request(optUrl, function (ma) {
        ma.on("data", function (data) {
            postData += data;
        }).on("end", function () {
            callback(JSON.parse(postData));
        }).on("error", function (e) {
            logger.error("speechPlay" + e.message);
            callback({status: 2});
        });
    });
    manage.on('error', function (e) {
        logger.error("speechPlay" + e.message);
        callback({status: 2});
    });
    manage.write(querystring.stringify(dataStr));
    manage.end();
};

/**
 *
 * @param dataStr dataStr {speech: rulePlay, id: id, time: time, aheadTime: aheadTime, taskNumber: number}
 * @param callback 返回状态码
 * @statusPlay 0 :手动停止后或者没有开始播报  1:开始播报或者等待
 */
var play = function (dataStr, callback) {
    var optUrl = url.parse(urlStr + "play.do");
    optUrl.method = "post";
    optUrl.headers = {"Content-Type": 'application/x-www-form-urlencoded'};

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
        var manage = http.request(optUrl, function (ma) {
            var postData = "";
            ma.on("data", function (data) {
                postData += data;
            }).on("end", function () {
                callback(JSON.parse(postData));
            }).on("error", function (e) {
                logger.error("play" + e.message);
                callback({status: 2});
            });
        });
        manage.on('error', function (e) {
            logger.error("play" + e.message);
            callback({status: 2});
        });
        delete dataStr.aheadTime;
        delete dataStr.time;
        manage.write(querystring.stringify(dataStr));
        manage.end();
    } else {
        global.timeout = schedule.scheduleJob(new Date(new Date().getTime() + 10000), function () {
            callback({status: 3});
        });
    }
};

/**
 *
 * @param callback 返回状态码 定时任务对象
 */
var stop = function (callback) {
    var optUrl = url.parse(urlStr + "stop.do");
    optUrl.method = "post";
    optUrl.headers = {"Content-Type": 'application/x-www-form-urlencoded'};
    var postData = "";
    var manage = http.request(optUrl, function (ma) {
        ma.on("data", function (data) {
            postData += data;
        }).on("end", function () {
            if (global.timeout) {
                global.timeout.cancel();
            }
            callback(JSON.parse(postData));
        }).on("error", function (e) {
            callback({status: 2});
            logger.error(e.message);
        });
    });
    manage.on('error', function (e) {
        logger.error("stop" + e.message);
        callback({status: 2});
    });
    manage.end();
};

var speechConfig = function (data, callback) {
    var optUrl = url.parse(urlStr + "speechConfig.do");
    optUrl.headers = {"Content-Type": 'application/x-www-form-urlencoded'};
    optUrl.method = "post";
    var postData = "";
    var manage = http.request(optUrl, function (ma) {
        ma.on("data", function (data) {
            postData += data;
        }).on("end", function () {
            callback(JSON.parse(postData));
        }).on("error", function (e) {
            logger.error(e.message);
            callback({status: 2});
        });
    });
    manage.on('error', function (e) {
        logger.error(e.message);
        callback({status: 2});
    });
    manage.write(querystring.stringify(data));
    manage.end();
};

module.exports = {
    speechPlay: speechPlay,
    play: play,
    stop: stop,
    speechConfig: speechConfig
};