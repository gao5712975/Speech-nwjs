/**
 * Created by Yuan on 2015/11/18.
 */
'use strict';
var url = require("url");
var http = require("http");
var logger = require('./resources/libs/logger').getLogger('speech.js');
var utils = require('./resources/libs/utils').initWindows($);
var SDK = require('./resources/libs/play');



/*---------------play-----------------*/
global.statusPlay = 0;
var play = function () {
    $("#play").click(function () {
        global.statusPlay = 1;
        if ($("#viewCarList >tr").length != 0) {
            var json = $("#viewCarList").children("tr:first").attr("data-json");
            json = JSON.parse(json);
            var id = json.id;
            var number = json.number;
            var rule = $("#playModal input[name=rulePlay]").val();
            var rulePlay = utils.rulePlay.rulePlayStr(json, rule);
            var aheadTime = $("#playModal input[name=aheadTime]").val();
            var data = {speech: rulePlay, id: id, time: json.time, aheadTime: aheadTime, taskNumber: number};

            $("#" + id).attr("class", "success text-center");
            $("#play").button("loading");

            SDK.play(data, function (d) {
                if (d.status == 0) {
                    var historyList = $("#historyList");
                    if (historyList.children("tr[id=" + id + "]").length == 0) {
                        historyList.append(utils.viewTableFun.carTohistory(id));
                    } else {
                        $("#viewCarList").children("tr[id=" + id + "]").remove();
                    }
                    recoveryPlay();
                    $("#" + id).attr("class", "text-center");
                } else if (d.status == 2) {
                    recoveryPlay();
                } else {
                    $("#play").button("reset");
                    $("#" + id).attr("class", "text-center");
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
            if (d.status == 1) {
                global.statusPlay = 0;
                $("#play").button("reset");
                $("#speechJob").button("reset");
                $("#speechPlay").button("reset");
                $(".singleCarList").button("reset");
            }
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
            if (data.status == 0) {
                //TODO
                recoveryPlay();
            }
            $("#speechPlay").button("reset");
        })
    })
};

/**
 * 播报过程中被其它任务中断需要恢复播报
 */
var recoveryPlay = function () {
    if(global.statusPlay == 1){
        console.info("恢复");
        $("#play").trigger("click");
    }
};

/*dataSpeech 自定义播报任务 标记位*/
var dataSpeech = undefined;
var speechJob = function () {
    $("#speechJob").click(function () {
        if (dataSpeech == undefined) {
            if ($("#speechList").children("tr[class='success text-center']").length > 0) {
                dataSpeech = $("#speechList").children("tr[class='success text-center']");
            } else {
                dataSpeech = $("#speechList").children("tr:first");
            }
        }
        var data = dataSpeech.attr("data-json");
        $("#speechJob").button("loading");
        dataSpeech.attr("class", "success text-center");
        SDK.speechPlay({speech: JSON.parse(data).content, taskNumber: '1'}, function (dat) {
            if (dataSpeech != undefined) {
                if (dat.status == 0 ) {
                    dataSpeech.attr("class", "text-center");
                    dataSpeech = dataSpeech.next("tr");
                    if (dataSpeech.attr("data-json") != undefined) {
                        $("#speechJob").trigger("click");
                    } else {
                        recoveryPlay();
                        dataSpeech = undefined;
                        $("#speechJob").button("reset");
                    }
                }
            }
        });
    })
};

var init = function () {
    /*任务播报*/
    play();
    /*任务停止*/
    stop();
    /*插播*/
    speechPlay();
    /*自定义任务*/
    speechJob();
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
    $("#" + id).find("button[class='btn btn-success singleCarList']").button("loading");
    var json = $("#" + id).attr("data-json");
    json = JSON.parse(json);
    var number = json.number;
    var rule = $("#playModal input[name=rulePlay]").val();
    var rulePlay = utils.rulePlay.rulePlayStr(json, rule);
    SDK.speechPlay({speech: rulePlay, taskNumber: number, id: id}, function (data) {
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
        }
        $("#" + id).find("button[class='btn btn-success singleCarList disabled']").button("reset");
        $("#" + id).attr("class", "text-center");
    });
}

/*自定义任务单个播报singlePlay*/
function singlePlay(id) {
    var data = JSON.parse($("#" + id).attr("data-json")).content;
    $("#" + id).attr("class", "success text-center");
    SDK.speechPlay({speech: data, taskNumber: 1}, function (data) {
        if(data.status == 0){

        }
    });
    $("#" + id).attr("class", "text-center");
    recoveryPlay();
}