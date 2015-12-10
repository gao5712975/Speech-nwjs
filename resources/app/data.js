/**
 * Created by Yuan on 2015/11/17.
 */
'use strict';
var url = require("url");
var http = require("http");
var uuid = require('node-uuid');
var fs = require('fs');
var ini = require("ini");
var path = require('path');
var nwPath = process.execPath;
var nwDir = path.dirname(nwPath);

var logger = require('./resources/libs/logger').getLogger('data.js');
var utils = require('./resources/libs/utils');

//!*根据地址获取数据*!
global.carData = [];
var time;
var getDate = function () {
    $("#getData").click(function () {
        var optUrl = url.parse(global.dataUrl);
        optUrl.headers = {"Content-Type": 'application/x-www-form-urlencoded'};
        optUrl.method = "post";

        var postData = "";
        var manage = http.request(optUrl, function (ma) {
            ma.setEncoding('utf8');
            ma.on("data", function (data) {
                postData += data;
            }).on("end", function () {
                var json = JSON.parse(postData);
                if (json.status == "01") {
                    global.carData = json.result;

                    clearInterval(time);
                    $("#getData").button("loading");//防止一直获取数据
                    $("#countdown").removeClass("hide");
                    var s = 60;
                    time = setInterval(function () {
                        $("#countdown").html(s + "s", s-- + "s");
                        if (s == -1) {
                            clearInterval(time);
                            $("#getData").button('reset');
                            $("#countdown").addClass("hide")
                        }
                    }, 1000);

                    utils.viewTable();
                } else if (json.status == "00") {
                    utils.alertModal("请登录");//没有登录
                } else {
                    utils.alertModal("系统错误");//系统错误
                }
            }).on("error", function (e) {
                logger.error("getDate"+e.message);
            });
        });
        manage.on('error', function (e) {
            logger.error("getDate"+e.message);
            utils.alertModal("服务连接失败");//系统错误
        });
        manage.write(querystring.stringify({id: global.company_id}));
        manage.end();
    })
};


/*保存以修改播报次数的车次信息 数组长度大于500，推陈出新*/
global.taskModifyArray = [];
var saveCarListNumber = function () {
    $("#saveCarList").click(function () {
        var id = $("#modifyCarListViewModal input[name=taskNumberId]:hidden").val();
        var data = $("#" + id).attr("data-json");
        data = JSON.parse(data);
        var taskNumber = $("#modifyCarListViewModal input[name=taskNumber]").val();
        data.number = parseInt(taskNumber);

        global.taskModifyArray.unshift({id:data.id,number:data.number});
        if (global.taskModifyArray.length >= 1000) {
            global.taskModifyArray.pop();
        }
        $("#" + id).children("td:eq(5)").html(taskNumber);
        $("#" + id).attr("data-json", JSON.stringify(data));
    });
};

/*自动跟新数据*/
var updateTime;
var autoGetData = function () {
    clearInterval(updateTime);
    var time = $("#getDataModal input[name=updateTime]").val();
    if(time.match(/^[0-9]+$/)){
        var intervalTime = parseInt(time) * 1000 * 60;
        /*每过一段时间跟新数据*/
        updateTime = setInterval(function () {
            $("#getData").trigger("click");
        }, intervalTime);
    }
};

var saveSpeech = function () {
    $("#saveSpeech").click(function () {
        var data = {
            title: $("#addSpeechModal input[name=title]").val(),
            content: $("#addSpeechModal textarea[name=content]").val()
        };
        var key = uuid.v1().replace(/\-/g, "");
        fs.exists(nwDir + '/tempJob.ini', function (exists) {
            if (!exists) {
                var cc = {};
                cc.scope = "local";
                cc.content = {};
                data.id = key;
                cc.content[key] = data;
                fs.writeFile(nwDir + '/tempJob.ini',ini.stringify(cc), function (err) {
                    if (err) throw err;
                    $("#speechList").append(utils.viewTableFun.viewSpeechStr(data));
                });
            }else{
                var sp = ini.parse(fs.readFileSync(nwDir + "/tempJob.ini", "utf8"));
                if (sp.content == undefined) {
                    sp.content = {};
                }
                data.id = key;
                sp.content[key] = data;
                fs.writeFileSync(nwDir + "/tempJob.ini", ini.stringify(sp), {start: 0, flags: "w", encoding: "utf8"});
                $("#speechList").append(utils.viewTableFun.viewSpeechStr(data));
            }
        });
    })
};

var viewSpeech = function () {
    fs.exists(nwDir + '/tempJob.ini', function (exists) {
        if (exists) {
            var sp = ini.parse(fs.readFileSync(nwDir + "/tempJob.ini", "utf8"));
            if (sp.content != undefined) {
                $.each(sp.content, function (index, obj) {
                    $("#speechList").append(utils.viewTableFun.viewSpeechStr(obj));
                });
            }
        }
    });
};

var updateSpeech = function () {
    var id = $("#addSpeechModal input[name=speechId]:hidden").val();
    var data = {
        id: id,
        title: $("#addSpeechModal input[name=title]").val(),
        content: $("#addSpeechModal textarea[name=content]").val()
    };
    fs.exists(nwDir + '/tempJob.ini', function (exists) {
        if (exists) {
            var sp = ini.parse(fs.readFileSync(nwDir + "/tempJob.ini", "utf8"));
            if (sp.content != undefined) {
                sp.content[id].title = data.title;
                sp.content[id].content = data.content;
                fs.writeFileSync(nwDir + "/tempJob.ini", ini.stringify(sp), {start: 0, flags: "w", encoding: "utf8"});
                $("#" + id).attr("data-json", JSON.stringify(data));
                $("#" + id).children("td:eq(0)").html(data.title);
                $("#" + id).children("td:eq(1)").html(data.content);
            }
        }
    });
};

var init = function () {
    /*手动获取数据*/
    getDate();
    /*展现本地数据*/
    utils.viewTable();
    /*保存以修改播报次数的车次信息*/
    saveCarListNumber();
    /*自动获取数据*/
    autoGetData();
    /*保存自定义任务*/
    saveSpeech();
    /*展现自定义任务*/
    viewSpeech();
};

init();

/*-----------------------------------------------------------------------*/
/*修改播报次数展现页*/
function modifyCarListView(id) {
    $('#modifyCarListViewModal').modal({
        backdrop: true,
        show: true
    });
    $("#modifyCarListViewModal input[name=taskNumberId]:hidden").val(id);
}

function goTop(fid, id) {
    for (var i = 0; i < global.carBusId.length; i++) {
        if (id.indexOf(global.carBusId[i]) != -1) {
            global.carBusId.splice(i, 1);
            return global.carBusId;
        }
    }
    $("#" + fid).prepend(utils.viewTableFun.historyToCar(id));
}

function goButton(fid, id) {
    for (var i = 0; i < global.carBusId.length; i++) {
        if (id.indexOf(global.carBusId[i]) != -1) {
            global.carBusId.splice(i, 1);
            return global.carBusId;
        }
    }
    $("#" + fid).prepend(utils.viewTableFun.historyToCar(id));
}

/*新增修改自定义任务*/
function modifySpeech(id) {
    $('#addSpeechModal').modal({
        backdrop: true,
        show: true
    }).on('hidden.bs.modal', function (e) {
        $("#saveSpeech").removeClass("hide");
        $("#updateSpeech").addClass("hide");
        $("#addSpeechModalLabel").html("添加");
    });
    var data = JSON.parse($("#" + id).attr("data-json"));
    $("#addSpeechModal input[name=title]").val(data.title);
    $("#addSpeechModal input[name=speechId]:hidden").val(id);
    $("#addSpeechModal textarea[name=content]").val(data.content);
    $("#addSpeechModalLabel").html("修改");
    $("#saveSpeech").addClass("hide");
    $("#updateSpeech").removeClass("hide");
}

/*删除自定义任务*/
function deleteSpeech(id) {
    fs.exists(nwDir + '/tempJob.ini', function (exists) {
        if (exists) {
            var sp = ini.parse(fs.readFileSync(nwDir + "/tempJob.ini", "utf8"));
            if (sp.content != undefined) {
                delete sp.content[id];
                fs.writeFileSync(nwDir + "/tempJob.ini", ini.stringify(sp), {start: 0, flags: "w", encoding: "utf8"});
            }
        }
    });
    $("#" + id).remove();
}

