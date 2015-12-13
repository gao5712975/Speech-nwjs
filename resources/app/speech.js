/**
 * Created by Yuan on 2015/11/18.
 */
'use strict';
var url = require("url");
var http = require("http");
var logger = require('./resources/libs/logger').getLogger('speech.js');
var utils = require('./resources/libs/utils');
var SDK = require('./resources/libs/play');


/*---------------play-----------------*/
global.statusPlay = 0;
var play = function () {
    $("#play").click(function () {
        if ($("#viewCarList >tr").length != 0) {
            global.statusPlay = 1;
            var json = $("#viewCarList").children("tr:first").attr("data-json");
            json = JSON.parse(json);
            var id = json.id;
            var number = json.number;
            var rule = $("#playModal input[name=rulePlay]").val();
            var rulePlay = utils.rulePlay.rulePlayStr(json, rule);
            var aheadTime = $("#playModal input[name=aheadTime]").val();
            var data = {speech: rulePlay, id: id, time: json.time, aheadTime: aheadTime, taskNumber: +number};

            $("#" + id).attr("class", "success text-center");
            $("#" + id).find("button:contains('立即播放')").button("loading");
            $("#play").button("loading");

            SDK.play(data, function (d) {
                if (d.status == 0) {
                    var historyList = $("#historyList");
                    if (historyList.children("tr[id=" + id + "]").length == 0) {
                        historyList.append(utils.viewTableFun.carTohistory(id));
                    } else {
                        $("#viewCarList").children("tr[id=" + id + "]").remove();
                    }
                    saveCarBusId(id);
                    recoveryPlay();
                    $("#" + id).find("button:contains('立即播放')").button("reset");
                    $("#" + id).attr("class", "text-center");
                } else if (d.status == 3) {
                    recoveryPlay();
                } else if(d.status == 1){
                    $("#" + id).find("button:contains('立即播放')").button("reset");
                    $("#" + id).attr("class", "text-center");
                }else{
                    utils.alertModal("系统错误");//系统错误
                    $("#play").button("reset");
                    return false;
                }
            });
        } else {
            $("#play").button("reset");
            return false;
        }
    })
};

/*------------stop-----------*/
var stop = function () {
    $("#stop,#speechStop").click(function () {
        SDK.stop(function (d) {
            if (d.status == 3) {
                global.statusPlay = 0;
            } else if (d.status == 2) {
                utils.alertModal("系统错误");//系统错误
            }
            $("#play").button("reset");
            $("#speechJob").button("reset");
            $("#speechPlay").button("reset");
            $(".singleCarList").button("reset");
        })
    })
};


/*-----------speechPlay-----------*/
/**
 * 插播
 */
var speechPlay = function () {
    $("#speechPlay").click(function () {
        $("#speechPlay").button("loading");
        SDK.speechPlay({speech: $("input[name=speech]").val(), taskNumber: 1}, function (data) {
            $("#speechPlay").button("reset");
            if (data.status == 0) {
                recoveryPlay();
            } else if (data.status == 2) {
                utils.alertModal("系统错误");//系统错误
            }else{
                return false;
            }
        })
    })
};

/**
 * 播报过程中被其它任务中断需要恢复播报
 */
var recoveryPlay = function () {
    if (global.statusPlay == 1) {
        $("#play").trigger("click");
    }else{
        return false;
    }
};

var init = function () {
    /*任务播报*/
    play();
    /*任务停止*/
    stop();
    /*插播*/
    speechPlay();
    ///*自定义任务*/
    //speechJob();
};

init();

global.carBusId = [];//已经读过的信息ID
/*保存以播报的车次ID 数组长度大于500，推陈出新*/
var saveCarBusId = function (id) {
    global.carBusId.unshift(id);
    if (global.carBusId.length == 100000) {
        global.carBusId.pop();
    }
};

/*车次列表立即播报*/
function singleCarListPlay(id) {
    $("#" + id).attr("class", "success text-center");
    $("#" + id).find("button:contains('立即播放')").button("loading");
    var json = $("#" + id).attr("data-json");
    json = JSON.parse(json);
    var number = json.number;
    var rule = $("#playModal input[name=rulePlay]").val();
    var rulePlay = utils.rulePlay.rulePlayStr(json, rule);
    SDK.speechPlay({speech: rulePlay, taskNumber: number}, function (data) {
        $("#" + id).find("button:contains('立即播放')").button("reset");
        $("#" + id).attr("class", "text-center");
        if (data.status == 0) {
            var historyList = $("#historyList");
            /*历史列表中不存在就插入否则就移除*/
            if (historyList.children("tr[id=" + id + "]").length == 0) {
                historyList.append(utils.viewTableFun.carTohistory(id));
            } else {
                $("#viewCarList").children("tr[id=" + id + "]").remove();
            }
            saveCarBusId(id);
            recoveryPlay();
        } else if (data.status == 1) {
            return false;
        }else{
            utils.alertModal("系统错误");//系统错误
        }
    });
}

/**
 * 1-单次播放,2-单曲循环,3-列表播放,4-列表循环,5-随机播放
 */
/*自定义任务单个播报singlePlay*/
function singlePlay(id) {
    var data = JSON.parse($("#" + id).attr("data-json")).content;
    $("#" + id).attr("class", "success text-center").find("button:contains('播放')").button("loading");
    SDK.speechPlay({speech: data, taskNumber: 1}, function (data) {
        $("#" + id).attr("class", "text-center");
        $("#" + id).find("button:contains('播放')").button("reset");
        if (data.status == 0) {
            var playMode = $("#playMode").attr("data-value");
            var index = $("#" + id).attr("data-index");
            var sum = $("#speechList >tr").length;
            var result = playModeFun(+playMode, +index, +sum);
            if (result != -1) {
                $("#speechList").children("tr:eq(" + result + ")").find("button:contains('播放')").click();
            }
            //单次播放或列表播放最后一个才能有机会去恢复播报任务。
            if(playMode == 1 || (playMode == 3 && index == $("#speechList > tr").length )){
                recoveryPlay();
            }
        } else if (data.status == 2) {
            utils.alertModal("系统错误");//系统错误
        } else {
            return true;
        }
    });
}

function playModeFun(playMode, index, sum) {
    switch (playMode) {
        case 1:
            return -1;
        case 2:
            return --index;
        case 3:
            if (index == sum) {
                return -1;
            } else {
                return index;
            }
        case 4:
            if (index == sum) {
                return 0;
            } else {
                return index;
            }
        case 5:
            var inn = parseInt(Math.random() * sum);
            while (inn+1 == index) {
                inn = parseInt(Math.random() * sum);
            }
            return inn;
        default:
            return -1;
    }
}