/**
 * Created by Yuan on 2015/12/29.
 */
'use strict';
var child_process = require('child_process');

/*执行命令*/
var execFun = function (cmd, callback) {
    child_process.execSync(cmd,null,null, function (error,stdout,stderr) {
        callback(error,stdout,stderr);
    });
};

/*执行bat文件*/
var execFileFun = function (path, callback) {
    child_process.execFileSync(path,null,null, function (error,stdout,stderr) {
        callback(error,stdout,stderr);
    });
};

module.exports = {
    execFun:execFun,
    execFileFun:execFileFun
};
