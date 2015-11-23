/**
 * Created by Yuan on 2015/11/17.
 */
'use strict';
var url = require("url");
var http = require("http");
var querystring = require("querystring");
var schedule = require("node-schedule");
var logger = require('./logger').getLogger('play.js');

/**
 *
 * @param dataStr {speech: rulePlay, taskNumber: number, id: id}
 * @param callblack 返回状态码
 */
var speechPlay = function (dataStr, callblack) {
    stop(function (da) {
        if (da.status == 1) {
            var optUrl = url.parse(global.dataUrl + "/admin/speechPlay.do");
            optUrl.method = "post";
            optUrl.headers = {"Content-Type": 'application/x-www-form-urlencoded'};
            var postData = "";
            var manage = http.request(optUrl, function (ma) {
                ma.on("data", function (data) {
                    postData += data;
                }).on("end", function () {
                    callblack(JSON.parse(postData));
                }).on("error", function (e) {
                    logger.error("speechPlay" + e.message);
                });
            });
            manage.on('error', function (e) {
                logger.error("speechPlay" + e.message);
            });
            manage.write(querystring.stringify(dataStr));
            manage.end();
        }
    });
};

/**
 *
 * @param dataStr dataStr {speech: rulePlay, id: id, time: time, aheadTime: aheadTime, taskNumber: number}
 * @param callblack 返回状态码
 * @statusPlay 0 :手动停止后或者没有开始播报  1:开始播报或者等待
 */
var play = function (dataStr,  callblack) {
   stop(function (da) {
       if(da.status == 1){
           var optUrl = url.parse(global.dataUrl + "/admin/speechPlay.do");
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
                       logger.info("play:结束");
                       callblack(JSON.parse(postData));
                   }).on("error", function (e) {
                       logger.error("play" + e.message);
                   });
               });
               manage.on('error', function (e) {
                   logger.error("play" + e.message);
               });
               delete dataStr.id;
               delete dataStr.aheadTime;
               delete dataStr.time;
               manage.write(querystring.stringify(dataStr));
               manage.end();
           } else {
               global.timeout = schedule.scheduleJob(new Date(new Date().getTime() + 5000), function () {
                   callblack({status: 2});
               });
           }
       }
   })
};

/**
 *
 * @param callblack 返回状态码 定时任务对象
 */
var stop = function (callblack) {
    var optUrl = url.parse(global.dataUrl + "/admin/stop.do");
    optUrl.method = "post";
    optUrl.headers = {"Content-Type": 'application/x-www-form-urlencoded'};
    var manage = http.request(optUrl, function (ma) {
        var postData = "";
        ma.on("data", function (data) {
            postData += data;
        }).on("end", function () {
            if ( global.timeout) {
                global.timeout.cancel();
            }
            callblack(JSON.parse(postData));
        }).on("error", function (e) {
            logger.error(e.message);
        });
    });
    manage.on('error', function (e) {
        logger.error("stop" + e.message);
    });
    manage.end();
};

module.exports = {
    speechPlay: speechPlay,
    play: play,
    stop: stop
};