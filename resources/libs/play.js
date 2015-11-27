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
var TTS = require('./resources/libs/libokvtts');

/**
*
* @param dataStr {speech: rulePlay, taskNumber: number, id: id}
* @param callblack 返回状态码
*/
var speechPlay = function (dataStr,callblack) {
    TTS.OKVPlay(dataStr.speech,dataStr.taskNumber, function (err, res) {
        callblack(res);
    })
};

/**
*
* @param dataStr dataStr {speech: rulePlay, id: id, time: time, aheadTime: aheadTime, taskNumber: number}
* @param callblack 返回状态码
* @statusPlay 0 :手动停止后或者没有开始播报  1:开始播报或者等待
*/
var play = function (dataStr,  callblack) {
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
        TTS.OKVPlay(dataStr.speech,dataStr.taskNumber, function (err, res) {
            callblack(res);
        })
    }else{
        global.timeout = schedule.scheduleJob(new Date(new Date().getTime() + 5000), function () {
            callblack({status: 2});
        });
    }

};

var stop = function (callblack) {
    TTS.stop(function (res) {
        if (global.timeout) {
            global.timeout.cancel();
        }
        callblack(res);
    })
};

var volumeConfig = function (data,callblack) {
    TTS.OKVSetVolume(data,function (res) {
        callblack(res);
    });
};

var speechConfig = function (data,callblack) {
    TTS.OKVSetSpeed(data,function (re) {
        callblack(res);
    });
};

var timbreConfig = function (data,callblack) {
    TTS.OKVSetLangMode(data,function (r) {
        callblack(res);
    });
};

module.exports = {
    speechPlay: speechPlay,
    play: play,
    stop: stop,
    volumeConfig:volumeConfig,
    speechConfig:speechConfig,
    timbreConfig:timbreConfig
};



/*

/!**
 *
 * @param dataStr {speech: rulePlay, taskNumber: number, id: id}
 * @param callblack 返回状态码
 *!/
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
                    utils.alertModal("系统错误");
                });
            });
            manage.on('error', function (e) {
                logger.error("speechPlay" + e.message);
                utils.alertModal("服务连接失败");
            });
            manage.write(querystring.stringify(dataStr));
            manage.end();
        }
    });
};

/!**
 *
 * @param dataStr dataStr {speech: rulePlay, id: id, time: time, aheadTime: aheadTime, taskNumber: number}
 * @param callblack 返回状态码
 * @statusPlay 0 :手动停止后或者没有开始播报  1:开始播报或者等待
 *!/
var play = function (dataStr,  callblack) {
   stop(function (da) {
       if(da.status == 1){
           var optUrl = url.parse(global.dataUrl + "/admin/speechPlay.do");
           optUrl.method = "post";
           optUrl.headers = {"Content-Type": 'application/x-www-form-urlencoded'};

           /!*按提前时间播报班车信息*!/
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
                       callblack({status: 503});
                       utils.alertModal("系统错误");
                   });
               });
               manage.on('error', function (e) {
                   logger.error("play" + e.message);
                   callblack({status: 404});
                   utils.alertModal("服务连接失败");
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

/!**
 *
 * @param callblack 返回状态码 定时任务对象
 *!/
var stop = function (callblack) {
    var optUrl = url.parse(global.dataUrl + "/admin/stop.do");
    optUrl.method = "post";
    optUrl.headers = {"Content-Type": 'application/x-www-form-urlencoded'};
    var postData = "";
    var manage = http.request(optUrl, function (ma) {
        ma.on("data", function (data) {
            postData += data;
        }).on("end", function () {
            if ( global.timeout) {
                global.timeout.cancel();
            }
            callblack(JSON.parse(postData));
        }).on("error", function (e) {
            callblack({status: 503});
            logger.error(e.message);
            utils.alertModal("系统错误");
        });
    });
    manage.on('error', function (e) {
        logger.error("stop" + e.message);
        callblack({status: 404});
        utils.alertModal("服务连接失败");
    });
    manage.end();
};

var speechConfig = function (data,callblack) {
    var optUrl = url.parse(global.dataUrl + "/admin/speechConfig.do");
    optUrl.headers = {"Content-Type": 'application/x-www-form-urlencoded'};
    optUrl.method = "post";
    var postData = "";
    var manage = http.request(optUrl, function (ma) {
        ma.on("data", function (data) {
            postData += data;
        }).on("end", function () {
            callblack({status: postData});
        }).on("error", function (e) {
            logger.error(e.message);
            callblack({status: 503});
            utils.alertModal("系统错误");
        });
    });
    manage.on('error', function (e) {
        logger.error(e.message);
        callblack({status: 404});
        utils.alertModal("服务连接失败");
    });
    manage.write(querystring.stringify(data));
    manage.end();
};
*/

