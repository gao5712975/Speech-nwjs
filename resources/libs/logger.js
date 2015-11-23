/**
 * Created by Yuan on 2015/11/16.
 */
'use strict';
var log4js = require("log4js");
var path = require('path');
var nwPath = process.execPath;
var nwDir = path.dirname(nwPath);
var fs = require("fs");

var folder = fs.existsSync(nwDir + '/logs');
if(!folder){
    fs.mkdir(nwDir + '/logs')
}

log4js.configure({
    appenders: [
        {
            type: 'console'
        },
        {
            type: 'dateFile',
            filename: nwDir + '/logs/',
            pattern: "logs-yyyy-MM-dd.log",
            maxLogSize: 1024,
            alwaysIncludePattern: true
        }
    ],
    replaceConsole: true
});

//log4js.setGlobalLogLevel(log4js.levels.ERROR);
log4js.setGlobalLogLevel(log4js.levels.DEBUG);

function setLogLevel(level){
    log4js.setGlobalLogLevel(level || log4js.levels.DEBUG);
}

function getLogger(file){
    return log4js.getLogger(file || "dateFileLog");
}

module.exports = {
    setLogLevel:setLogLevel,
    getLogger:getLogger
};