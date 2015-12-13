/**
 * Created by Yuan on 2015/10/9.
 */
'use strict';
var ffi = require('ffi');
var path = require('path');
var nwPath = process.execPath;
var nwDir = path.dirname(nwPath);
var iconv = require('iconv-lite');

var libokvtts = ffi.Library(nwDir + '\\libokvtts.dll', {
    'OKVGetLangMode': ['int', []],
    'OKVGetSpeed': ['int', []],
    'OKVGetSupportLang': ['int', []],
    'OKVGetVolume': ['int', []],
    'OKVInit': ['int', ['string']],
    'OKVPlay': ['int', ['string']],
    'OKVSetLangMode': ['int', ['int']],
    'OKVSetSpeed': ['int', ['int']],
    'OKVSetVolume': ['int', ['int']],
    'OKVStop': ['int', []],
    'OKVUnInit': ['int', ['void']]
});
var init = libokvtts.OKVInit(nwDir);
if (init == 0) {
    console.info("初始化成功!!!");
} else {
    console.info("初始化失败/(ㄒoㄒ)/~~");
}

var status = 0;// 0：播报完成且不是中途中断。1：不管是否播报，都认为是被中断播报。2：系统错误，动态库加载失败。3：手动停止后的状态。

function copyObj(oldObj, newObj) {
    for (var k in oldObj) {
        if (oldObj.hasOwnProperty(k)) {
            if (newObj[k] == undefined) {
                newObj[k] = oldObj[k];
            }
        }
    }
}

/**
 * 播放功能
 * @param play_text 播放文字
 * @param num 次数
 * @param callback 状态返回
 * @constructor
 */

var array = [];
var OKVPlay = function (play_text,num, callback) {
    play_text = iconv.encode(play_text,'GBK');
    var libokv = {};
    copyObj(libokvtts, libokv);
    array.unshift(libokv);
    libokv.OKVPlay.async(play_text, function (err, res) {
        if(array.length > 1){
            status = 1;
        }else{
            if(status != 3){//如果点击停止按钮就不把状态改为0；
                status = 0;
            }
        }
        if (res == 0 && status != 3) {
            if (--num == 0) {
            array.pop();
            callback({status: status});
            status = 0;
            } else {
                if(array.length > 1) {
                    array.pop();
                    callback({status: status});
                }else{
                    array.pop();
                    return OKVPlay(play_text, num, callback);
                }
            }
        } else if (res == 2) {
            array.pop();
            callback({status: res});
        } else {
            array.pop();
            callback({status: 1});
            status = 0;
        }
    });
};

/**
 * 停止
 * @param callback 状态返回
 * @constructor
 */
var OKVStop = function (callback) {
    status = 3;
    libokvtts.OKVStop.async(function (err, res) {
        if (res == 0) {
            callback({status: 3});
        } else if (res == 2) {
            callback({status: 2});
        }
    });
};

/**
 *  设置语言模式
 * @param langMode
 * @param callback
 * @constructor
 */
var OKVSetLangMode = function (langMode, callback) {
    libokvtts.OKVSetLangMode.async(langMode, function (err, res) {
        if (res == 0) {
            callback({status: res});
        } else if (res == 2) {
            callback({status: res});
        }
    });
};

/**
 * 设置语速
 * @param speed
 * @param callback
 * @constructor
 */
var OKVSetSpeed = function (speed, callback) {
    libokvtts.OKVSetSpeed.async(speed, function (err, res) {
        if (res == 0) {
            callback({status: res});
        } else if (res == 2) {
            callback({status: res});
        }
    });
};

/**
 * 设置音量
 * @param volume
 * @param callback
 * @constructor
 */
var OKVSetVolume = function (volume, callback) {
    libokvtts.OKVSetVolume.async(volume, function (err, res) {
        if (res == 0) {
            callback({status: res});
        } else if (res == 2) {
            callback({status: res});
        }
    });
};

module.exports = {
    libokvtts: libokvtts,
    OKVSetVolume: OKVSetVolume,
    OKVSetSpeed: OKVSetSpeed,
    OKVSetLangMode: OKVSetLangMode,
    OKVStop: OKVStop,
    OKVPlay: OKVPlay
};


//var wininet = ffi.Library('Wininet.dll', {
//    'InternetGetConnectedState': ['bool', ['int', 'int']]
//});
//
//var intPtr = ref.alloc('int');
//console.log(wininet.InternetGetConnectedState(0, 0));
//console.log(nwDir);

/*
 1    0 00011AD0 OKVGetLangMode
 2    1 00011AE0 OKVGetSpeed
 3    2 00011AF0 OKVGetSupportLang
 4    3 00011BB0 OKVGetVolume
 5    4 00011BC0 OKVInit
 6    5 00011EC0 OKVPlay
 7    6 00011EE0 OKVSetLangMode
 8    7 00012030 OKVSetSpeed
 9    8 00012070 OKVSetVolume
 10    9 000120A0 OKVStop
 11    A 000120B0 OKVUnInit*/

//OKVPlay('123', 5, function (res) {
//
//});
//
//setTimeout(function () {
//    OKVStop(function (res) {
//        console.info(res);
//    });
//}, 200000);

//console.info();
//setTimeout(function () {
//    libokvtts.OKVStop.async(function (err, res) {
//        console.info(res);
//    });
//},2000);
//libokvtts.OKVPlay.async('1231321321321234546', function (err, res) {
//    console.info(res);
//});
//
//libokvtts.OKVStop.async(function (err, res) {
//   console.info(res);
//});

/*动态链接*/
//var wininetDynamic = ffi.DynamicLibrary('libokvtts.dll');
//var s = ffi.ForeignFunction(wininetDynamic.get('OKVInit'),'int',['string'])('.');
//var a = ffi.ForeignFunction(wininetDynamic.get('OKVPlay'),'int',['string'])('12');
//console.log(s);
//console.log(a);

//var libokvtts = {
//    OKVInit: function () {
//        var okvtts = ffi.DynamicLibrary('libokvtts.dll');
//        this.okvtts = okvtts;
//        return ffi.ForeignFunction(okvtts.get('OKVInit'), 'int', ['string'])('.');
//    },
//    OKVPlay: function (play_text) {
//        return ffi.ForeignFunction(this.okvtts.get('OKVPlay'), 'int', ['string'])(play_text);
//    },
//    OKVGetLangMode: function () {
//        return ffi.ForeignFunction(this.okvtts.get('OKVGetLangMode'), 'int', []);
//    },
//    OKVGetSpeed: function () {
//        return ffi.ForeignFunction(this.okvtts.get('OKVGetSpeed'), 'int', []);
//    },
//    OKVGetSupportLang: function () {
//        return ffi.ForeignFunction(this.okvtts.get('OKVGetSupportLang'), 'int', []);
//    },
//    OKVGetVolume: function () {
//        return ffi.ForeignFunction(this.okvtts.get('OKVGetVolume'), 'int', []);
//    },
//    OKVSetLangMode: function (langMode) {
//        return ffi.ForeignFunction(this.okvtts.get('OKVSetLangMode'), 'int', ['int'])(langMode);
//    },
//    OKVSetSpeed: function (speed) {
//        return ffi.ForeignFunction(this.okvtts.get('OKVSetSpeed'), 'int', ['int'])(speed);
//    },
//    OKVSetVolume: function (volume) {
//        return ffi.ForeignFunction(this.okvtts.get('OKVSetVolume'), 'int', ['int'])(volume);
//    },
//    OKVStop: function () {
//        return ffi.ForeignFunction(this.okvtts.get('OKVStop'), 'int', []);
//    },
//    OKVUnInit: function () {
//        return ffi.ForeignFunction(this.okvtts.get('OKVUnInit'), 'int', ['void']);
//    }
//};
//
//console.info(libokvtts.OKVInit());
//setTimeout(function () {
//    libokvtts.OKVUnInit.async(function (err, res) {
//        console.info(res);
//    })
//},2000);
//
//libokvtts.OKVPlay.async('132132132113213213321',function (err, res) {
//    console.info(res);
//});
//console.info(libokvtts.OKVSetSpeed(3));


/*
 1    0 00011AD0 OKVGetLangMode
 2    1 00011AE0 OKVGetSpeed
 3    2 00011AF0 OKVGetSupportLang
 4    3 00011BB0 OKVGetVolume
 5    4 00011BC0 OKVInit
 6    5 00011EC0 OKVPlay
 7    6 00011EE0 OKVSetLangMode
 8    7 00012030 OKVSetSpeed
 9    8 00012070 OKVSetVolume
 10    9 000120A0 OKVStop
 11    A 000120B0 OKVUnInit*/

