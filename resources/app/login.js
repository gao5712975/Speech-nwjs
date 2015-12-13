/**
 * Created by Yuan on 2015/11/17.
 */
'use strict';
var url = require("url");
var http = require("http");
var querystring = require("querystring");
var fs = require('fs');
var ini = require("ini");
var path = require('path');
var nwPath = process.execPath;
var nwDir = path.dirname(nwPath);

var logger = require('./resources/libs/logger').getLogger('login.js');
var utils = require('./resources/libs/utils');

global.company_id = ""; //公司ID
var login = function () {
    $("#login").click(function () {
        var user = $("#loginModal input[name=user]").val();
        var password = $("#loginModal input[name=password]").val();
        var data = {
            user: user,
            password: password
        };
        var optUrl = url.parse(global.loginUrl);
        optUrl.method = "post";
        optUrl.headers = {"Content-Type": 'application/x-www-form-urlencoded'};
        var postData = "";
        var manage = http.request(optUrl, function (ma) {
            ma.on("data", function (data) {
                postData += data;
            }).on("end", function () {
                postData = JSON.parse(postData);
                if (postData.status == "00") {
                    utils.alertModal("用户或密码错误");
                } else if (postData.status == "01") {
                    global.company_id = postData.id;
                    var lo = {};
                    try {
                        lo = ini.parse(fs.readFileSync(nwDir + "/config.ini", "utf8"));
                    } catch (err) {
                        logger.error("config.ini 文件不存在")
                    }
                    if (lo.login == undefined) {
                        lo.login = {};
                    }
                    lo.login.user = user;
                    lo.login.password = password;
                    try {
                        fs.writeFileSync(nwDir + "/config.ini", ini.stringify(lo), {
                            start: 0,
                            flags: "w",
                            encoding: "utf8"
                        });
                    } catch (err) {
                        logger.error("config.ini 文件不存在")
                    }
                    //登录后加载数据
                    $("#getData").trigger("click");
                } else {
                    logger.info("postData" + postData.status);
                    utils.alertModal("系统错误");
                }
            }).on("error", function (e) {
                utils.alertModal("系统错误");
                logger.error(e.message);
            });
        });
        manage.on('error', function (e) {
            logger.error("login"+e.message);
            utils.alertModal("服务连接失败");
            fs.readFile(nwDir + "/data.ini","utf8", function (err,data) {
                var d = JSON.parse(data);
                global.carData = d;
                utils.viewTable();
            })
        });
        manage.write(querystring.stringify(data));
        manage.end();
    });
};

var init = function(){
    $("[data-target=#loginModal]").trigger("click");
    login();
};

init();