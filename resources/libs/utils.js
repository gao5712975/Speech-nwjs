/**
 * Created by Yuan on 2015/11/17.
 */
'use strict';
var fs = require('fs');
var $ = global.$;

var alertModal = function (text) {
    $("#alertModalText").text(text);
    $("[data-target=#alertModal]").trigger("click");
    $('#alertModal').on('hidden.bs.modal', function () {
        $("body").css("padding-right", "0");
    });
};

var rulePlay = {
    rulePlayStr: function (data, rule) {
        if (rule != undefined && rule != "") {
            rule = rule.replace("${terminus}", data.terminus);
            rule = rule.replace("${carNumber}", rulePlay.numberOfString(data.carNumber));
            rule = rule.replace("${time}", data.time);
            rule = rule.replace("${platformNo}", data.platformNo);
        } else {
            rule = "尊敬的旅客，去往终点站、" + data.terminus + "、班次为" + rulePlay.numberOfString(data.carNumber) + "号的汽车、将在" + data.time + "准时发车，请旅客们提前去往" + data.platformNo + "，谢谢！";
        }
        return rule;
    }, numberOfString: function (number) {
        var s = number.split("");
        var nu = "";
        for (var i = 0, j = s.length; i < j; i++) {
            switch (s[i]) {
                case '0':
                    nu += "零";
                    break;
                case '1':
                    nu += "一";
                    break;
                case '2':
                    nu += "二";
                    break;
                case '3':
                    nu += "三";
                    break;
                case '4':
                    nu += "四";
                    break;
                case '5':
                    nu += "五";
                    break;
                case '6':
                    nu += "六";
                    break;
                case '7':
                    nu += "七";
                    break;
                case '8':
                    nu += "八";
                    break;
                case '9':
                    nu += "九";
                    break;
                default:
                    nu += s[i];
                    break;
            }
        }
        return nu;
    }
};


var viewTableFun = {
    appendCarList: function (json, id, cb) {
        var s = "";
        var number = $("#playModal input[name=taskNumber]").val();
        if (+number === 0) {
            number = 1;
        }
        $.each(json, function (index, obj) {
            if (!obj.numberMo) {
                obj.number = number;
            }
            var select = "<button type='button' data-loading-text='立即播放' class='btn btn-success singleCarList' onclick=\"singleCarListPlay(\'" + obj.id + "\')\">立即播放</button> <button type='button' class='btn btn-info'onclick=\"modifyCarListView(\'" + obj.id + "\')\">修改</button>";
            s += "<tr data-json=\'" + JSON.stringify(obj) + "\' id=\'" + obj.id + "\' class='text-center'><td>" + obj.time + "</td><td>" + obj.carNumber + "</td><td>" + obj.terminus + "</td><td>" + obj.carType + "</td><td>" + obj.platformNo + "</td><td>" + obj.number + "</td><td>" + select + "</td></tr>";
        });
        setTimeout(function () {
            cb(id, s);
            s = "";
        }, 30)
    },
    appendHistory: function (json, id, cb) {
        var s = "";
        $.each(json, function (index, obj) {
            obj.number = $("#playModal input[name=taskNumber]").val();
            var select = "<button type='button' class='btn btn-info' onclick=\"goTop(\'viewCarList\',\'" + obj.id + "\')\">顶部</button> <button type='button' class='btn btn-success'onclick=\"goButton(\'viewCarList\',\'" + obj.id + "\')\">尾部</button>";
            s += "<tr data-json=\'" + JSON.stringify(obj) + "\' id=\'" + obj.id + "\' class='text-center'><td>" + obj.time + "</td><td>" + obj.carNumber + "</td><td>" + obj.terminus + "</td><td>" + obj.carType + "</td><td>" + obj.platformNo + "</td><td>" + obj.number + "</td><td>" + select + "</td></tr>";
        });
        setTimeout(function () {
            cb(id, s);
            s = "";
        }, 30)
    },
    appendStr: function (id, str) {
        $("#" + id).append(str);
    },
    viewCarList: function (data) {
        $("#viewCarList").children("tr").remove();
        viewTableFun.appendCarList(data, "viewCarList", viewTableFun.appendStr);
    },
    viewHistory: function (data) {
        $("#historyList").children("tr").remove();
        viewTableFun.appendHistory(data, "historyList", viewTableFun.appendStr);
    },
    carTohistory: function (id) {
        var s = "<button type='button' class='btn btn-info' onclick=\"goTop(\'viewCarList\',\'" + id + "\')\">顶部</button> <button type='button' class='btn btn-success'onclick=\"goButton(\'viewCarList\',\'" + id + "\')\">尾部</button>";
        $("#" + id).children("td:eq(6)").html(s);
        return $("#" + id);
    },
    historyToCar: function (id) {
        var s = "<button type='button' data-loading-text='立即播放' class='btn btn-success singleCarList' onclick=\"singleCarListPlay(\'" + id + "\')\">立即播放</button> <button type='button' class='btn btn-info'onclick=\"modifyCarListView(\'" + id + "\')\">修改</button>";
        $("#" + id).children("td:eq(6)").html(s);
        return $("#" + id);
    },
    viewSpeechStr: function (data) {
        var con = data.content;
        if (data.content.length > 50) {
            con = data.content.substring(0, 50) + "...";
        }
        var index = parseInt($("#speechList >tr").length) + 1;
        var select = "<div class='btn-group'><button type='button' data-loading-text='播放' class='btn btn-success' onclick=\"singlePlay(\'" + data.id + "\')\">播放</button> <button type='button' class='btn btn-info'onclick=\"modifySpeech(\'" + data.id + "\')\">修改</button> <button type='button' class='btn btn-warning'onclick=\"deleteSpeech(\'" + data.id + "\')\">删除</button></div>";
        var str = "<tr class='text-center' data-index='" + index + "' data-json='" + JSON.stringify(data) + "' id='" + data.id + "'><td>" + data.title + "</td><td>" + con + "</td><td> " + select + " </td></tr>";
        return str;
    }
};

/*从本地取数据展现*/

var viewTable = function () {
    var data = global.carData;
    var carArray = new Array(0);//车次列表
    var oldArray = new Array(0);//历史车次列表
    for (var s in data) {
        var hour = new Date().getHours();
        var minutes = new Date().getMinutes();
        var hour_d = parseInt(data[s].time.split(":")[0]);
        var minutes_d = parseInt(data[s].time.split(":")[1]);
        /*过滤已修改的播报次数的车次*/
        if (JSON.stringify(global.taskModifyArray).indexOf(data[s].id) != -1) {
            for (var i = 0, j = global.taskModifyArray.length; i < j; i++) {
                if (global.taskModifyArray[i].id == data[s].id) {
                    data[s].number = global.taskModifyArray[i].number;
                    data[s].numberMo = 1;
                }
            }
        }
        /*过滤到期时间*/
        if (hour_d > hour || (hour_d == hour && minutes_d + 1 > minutes)) {
            /*已播报的任务过滤到历史列表中*/
            if (global.carBusId.indexOf(data[s].id) == -1) {
                carArray.push(data[s]);
            } else {
                oldArray.push(data[s]);
            }
        } else {
            oldArray.push(data[s]);
        }
    }
    viewTableFun.viewCarList(carArray);
    viewTableFun.viewHistory(oldArray);
};

/*读取properties文件 不带注释*/
var properties = {
    proRead: function (uri, encoding) {
        var encoding = encoding == null ? 'UTF-8' : encoding;  //定义编码类型
        try {
            var content = fs.readFileSync(uri, encoding);
            var regexjing = /\s*(#+)/;  //去除注释行的正则
            var regexkong = /\s*=\s*/;  //去除=号前后的空格的正则
            var keyvalue = {};  //存储键值对
            var arr_case = null;
            var regexline = /.+/g;  //匹配换行符以外的所有字符的正则
            while (arr_case = regexline.exec(content)) {  //过滤掉空行
                if (!regexjing.test(arr_case)) {  //去除注释行
                    keyvalue[arr_case.toString().split(regexkong)[0]] = arr_case.toString().split(regexkong)[1];  //存储键值对
                    console.log(arr_case.toString());
                }
            }
        } catch (e) {
            e.message  //这里根据自己的需求返回
        }
        return keyvalue;
    },
    proWrite: function (uri, data) {
        var str = "";
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                str += key + "=" + data[key] + "\r\n"
            }
        }
        fs.writeFileSync(uri, str, {start: 0, flags: "w", encoding: "utf8"});
    }
};

module.exports = {
    alertModal: alertModal,
    rulePlay: rulePlay,
    viewTableFun: viewTableFun,
    viewTable: viewTable,
    properties:properties
};