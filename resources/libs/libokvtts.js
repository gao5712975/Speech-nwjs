/**
 * Created by Yuan on 2015/10/9.
 */
'use strict';
var ffi = require('ffi');
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
{
    var libokvtts = ffi.Library('libokvtts.dll', {
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

    libokvtts.OKVInit('.');
}
var status_play = 0; //初始状态0，停止后返回赋值1，播放完成后赋值0；

/**
 * 播放功能
 * @param play_text 播放文字
 * @param num 次数
 * @param callback 状态返回
 * @constructor
 */
var OKVPlay = function (play_text, num, callback) {
    libokvtts.OKVPlay.async(play_text, function (err, res) {
        if (res == 0 && status_play == 0) {
            if (--num == 0) {
                status_play = 0;
                callback(res);
            } else {
                return OKVPlay(play_text, num,callback);
            }
        }
    });
};

/**
 * 停止
 * @param callback 状态返回
 * @constructor
 */
var OKVStop = function (callback) {
    libokvtts.OKVStop.async(function (err, res) {
        status_play = 1;
        callback(res);
    });
};

/**
 *  设置语言模式
 * @param langMode
 * @param callback
 * @constructor
 */
var OKVSetLangMode = function (langMode, callback) {
    libokvtts.OKVSetLangMode.async(langMode,function (err, res) {
        callback(res);
    });
};

/**
 * 设置语速
 * @param speed
 * @param callback
 * @constructor
 */
var OKVSetSpeed = function (speed, callback) {
    libokvtts.OKVSetSpeed.async(speed,function (err, res) {
        callback(res);
    });
};

/**
 * 设置音量
 * @param volume
 * @param callback
 * @constructor
 */
var OKVSetVolume = function (volume, callback) {
    libokvtts.OKVSetVolume.async(volume,function (err, res) {
        callback(res);
    });
};

module.exports = {
    libokvtts: libokvtts,
    OKVSetVolume:OKVSetVolume,
    OKVSetSpeed:OKVSetSpeed,
    OKVSetLangMode:OKVSetLangMode,
    OKVStop:OKVStop,
    OKVPlay:OKVPlay
};

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

