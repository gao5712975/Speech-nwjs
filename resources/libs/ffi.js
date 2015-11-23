/**
 * Created by Yuan on 2015/10/9.
 */
var fs = require('fs');
var ffi = require('ffi');
var ref = require('ref');
var path = require('path');
var nwPath = process.execPath;
var nwDir = path.dirname(nwPath);


var wininet = ffi.Library('Wininet.dll', {
    'InternetGetConnectedState': ['bool', ['int', 'int']]
});

var intPtr = ref.alloc('int');
console.log(wininet.InternetGetConnectedState(0, 0));
console.log(nwDir);

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


//var sizeof = function (str, charset) {
//    var total = 0,
//        charCode, i, len;
//    charset = charset ? charset.toLowerCase() : '';
//    if (charset === 'utf-16' || charset === 'utf16') {
//        for (i = 0, len = str.length; i < len; i++) {
//            charCode = str.charCodeAt(i);
//            if (charCode <= 0xffff) {
//                total += 2;
//            } else {
//                total += 4;
//            }
//        }
//    } else {
//        for (i = 0, len = str.length; i < len; i++) {
//            charCode = str.charCodeAt(i);
//            if (charCode <= 0x007f) {
//                total += 1;
//            } else if (charCode <= 0x07ff) {
//                total += 2;
//            } else if (charCode <= 0xffff) {
//                total += 3;
//            } else {
//                total += 4;
//            }
//        }
//    }
//    return total;
//};
//
//console.info("你好".replace(/[^x00-xFF]/g, '**').length);
//
//
//var msc = ffi.Library(nwDir + '\\msc.dll', {
//    "MSPLogin": ['int', ['string', 'string', 'string']],
//    "MSPSetParam": ['int', ['string', 'string']],
//    "QTTSSessionBegin": ['int', ['string', ref.refType('int')]],
//    "QTTSTextPut": ['int', ['int', 'string', 'int', 'string']],
//    "QTTSAudioGet": ['void', ['int', ref.refType('int'), ref.refType('int'), ref.refType('int')]],
//    "QTTSSessionEnd": ['int', ['int', 'string']]
//});
//var ret = ref.alloc('int');
//console.log("MSPLogin " + msc.MSPLogin('465716992@qq.com', 'gao138708', 'appid=564c0f50,engine_start=tts,tts_res_path=fo|msc\\res\\tts\\common.jet'));
//
//var paraName = "engine_start";
//var paraValue = "engine_start=tts,voice_name=xiaoyan,tts_res_path=fo|msc\\res\\tts\\xiaoyan.jet";
//console.info("MSPSetParam " + msc.MSPSetParam(paraName, paraValue));
//
//var s = 'engine_type=local,text_encoding=UTF8,voice_name=xiaoyan,tts_res_path=fo|msc\\res\\tts\\common.jet;fo|msc\\res\\tts\\xiaoyan.jet,sample_rate=16000';
//var sess_id = msc.QTTSSessionBegin(s, ret);
////sess_id = ""+sess_id+"";
//console.info("QTTSSessionBegin " + sess_id);
//var text = "你";
//console.log(sizeof(text));
//console.info("QTTSTextPut " + msc.QTTSTextPut(sess_id, text, sizeof(text), null));
//
//var audio_len = ref.alloc('int');
//var synth_status = ref.alloc('int');
//
//fs.open(__dirname+"\\123.pcm", 'r+', function (err, ds) {
//    while(true){
//        fs.write(ds,msc.QTTSAudioGet(sess_id, audio_len, synth_status, ret),function(err, written, buffer){
//
//        });
//        //console.log(synth_status.toString());
//        if(synth_status.toString() == 2){
//            break;
//        }
//    }
//});
//

//console.info("QTTSSessionEnd " + msc.QTTSSessionEnd(sess_id, null));

//var audio_len = ref.alloc('int');
//var synth_status = ref.alloc('int');

//var data = msc.QTTSAudioGet(sess_id,audio_len,synth_status,ret);
//console.log(data);


//var libokvtts = ffi.Library(nwDir+'\\bin\\libokvtts.dll', {
//    //'OKVGetLangMode':['int',[]],
//    //'OKVGetSpeed':['int',[]],
//    //'OKVGetSupportLang':['int',[]],
//    //'OKVGetVolume':['int',[]],
//    'OKVInit':['int',['string']],
//    'OKVPlay':['int',['string']],
//    'OKVSetLangMode': ['int', [ 'int']],
//    'OKVSetSpeed': ['int', [ 'int']],
//    'OKVSetVolume': ['int', [ 'int']],
//    'OKVStop': ['int', []],
//    'OKVUnInit': ['int', ['void']]
//});

////
//setTimeout(function () {
//    console.log(nwDir);
//    console.log(libokvtts.OKVInit(nwDir+'\\bin\\'));
//    console.log(libokvtts.OKVSetVolume(1));
//    console.log(libokvtts.OKVPlay('1'));
//},2000);

var arr = new Array(6);
arr[0] = "George";
arr[1] = "John";
arr[2] = "Thomas";
arr[3] = "James";
arr[4] = "Adrew";
arr[5] = "Martin";

console.info(arr);
arr.splice(2,1);
console.info(arr);
/*
 1    0 000010C0 _Java_com_okvoice_tts_NativeEngine_getLangMode@8
 2    1 000010F0 _Java_com_okvoice_tts_NativeEngine_getSpeed@8
 3    2 00001020 _Java_com_okvoice_tts_NativeEngine_getSupportLang@12
 4    3 00001120 _Java_com_okvoice_tts_NativeEngine_getVolume@8
 5    4 00001000 _Java_com_okvoice_tts_NativeEngine_init@8
 6    5 000011F0 _Java_com_okvoice_tts_NativeEngine_play@12
 7    6 000010A0 _Java_com_okvoice_tts_NativeEngine_setLangMode@12
 8    7 000010D0 _Java_com_okvoice_tts_NativeEngine_setSpeed@12
 9    8 00001100 _Java_com_okvoice_tts_NativeEngine_setVolume@12
 10    9 00001240 _Java_com_okvoice_tts_NativeEngine_stop@8
 11    A 00001010 _Java_com_okvoice_tts_NativeEngine_unInit@8
 */
//
//wininetJava = ffi.Library('okvtts4j.dll', {
//    '_Java_com_okvoice_tts_NativeEngine_getLangMode@8': ['int', []],
//    '_Java_com_okvoice_tts_NativeEngine_getSpeed@8': ['int', []],
//    '_Java_com_okvoice_tts_NativeEngine_getSupportLang@12': ['int', []],
//    '_Java_com_okvoice_tts_NativeEngine_getVolume@8': ['int', []],
//    '_Java_com_okvoice_tts_NativeEngine_init@8': ['int', []],
//    '_Java_com_okvoice_tts_NativeEngine_play@12': ['int', ['string']],
//    '_Java_com_okvoice_tts_NativeEngine_setLangMode@12': ['int', ['int']],
//    '_Java_com_okvoice_tts_NativeEngine_setSpeed@12': ['int', ['int']],
//    '_Java_com_okvoice_tts_NativeEngine_stop@8': ['int', []],
//    '_Java_com_okvoice_tts_NativeEngine_unInit@8': ['int', []]
//});
//console.log(wininetJava['_Java_com_okvoice_tts_NativeEngine_init@8']());

/*动态链接*/
//wininetDynamic = ffi.DynamicLibrary(nwDir+'\\libokvtts.dll');
//var s = ffi.ForeignFunction(wininetDynamic.get('OKVInit'),'int',[])();
//var a = ffi.ForeignFunction(wininetDynamic.get('OKVPlay'),'int',['string'])('12');
//console.log(s);
//console.log(a);
