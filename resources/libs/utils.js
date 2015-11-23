/**
 * Created by Yuan on 2015/11/17.
 */
'use strict';

var $;

var initWindows  = function ($$) {
    $ = $$;
    return module.exports;
};

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
        var num = $("#playModal input[name=taskNumber]").val();
        $.each(json, function (index, obj) {
            obj.number = num;
            var select = "<button type='button'data-loading-text='立即播放' class='btn btn-success singleCarList' onclick=\"singleCarListPlay(\'" + obj.id + "\')\">立即播放</button> <button type='button' class='btn btn-info'onclick=\"modifyCarListView(\'" + obj.id + "\')\">修改</button>";
            s += "<tr data-json=\'" + JSON.stringify(obj) + "\' id=\'" + obj.id + "\' class='text-center'><td>" + obj.time + "</td><td>" + obj.carNumber + "</td><td>" + obj.terminus + "</td><td>" + obj.carType + "</td><td>" + obj.platformNo + "</td><td>" + num + "</td><td>" + select + "</td></tr>";
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
        var select = "<div class='btn-group'><button type='button' class='btn btn-success' onclick=\"singlePlay(\'" + data.id + "\')\">播放</button> <button type='button' class='btn btn-info'onclick=\"modifySpeech(\'" + data.id + "\')\">修改</button> <button type='button' class='btn btn-warning'onclick=\"deleteSpeech(\'" + data.id + "\')\">删除</button></div>";
        var str = "<tr class='text-center' data-json='" + JSON.stringify(data) + "' id='" + data.id + "'><td>" + data.title + "</td><td>" + data.content + "</td><td> " + select + " </td></tr>";
        return str;
    }
};

module.exports = {
    initWindows: initWindows,
    alertModal: alertModal,
    rulePlay: rulePlay,
    viewTableFun: viewTableFun
};