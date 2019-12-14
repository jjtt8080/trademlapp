'use strict';
var label_data = ["time",  "low", "open", "close", "high"];
var volume_label = ["time", "volume"];

function ConvertData(input, resolution) {
    if (input === '' || input === undefined) {
        console.log("bad format of input");
        return {};
    }
    if (input.hasOwnProperty("h") === false) {
        return {};
    }
    var inputObj = input, data = [], volumeData = [];
    data[0] = label_data;
    volumeData[0] = volume_label;
     // First make sure status is ok
    for (var i = 0; i < inputObj.h.length; ++i) {
      var t = inputObj.t[i];
      var dateO = new Date(t*1000);
      console.log("dateO", dateO);
      var d = '';
      if (resolution === 'M') {
          d = (dateO.getYear() +1900)+ '/' + (dateO.getMonth()+1) + '/' +  dateO.getDate();
      }
      else if (resolution === 'D' || resolution === 'W') {
          d = (dateO.getMonth()+1) + '/' +  dateO.getDate();
      }else {
          d = (dateO.getHours()) + ':' + dateO.getMinutes();
      }
      data[i+1] = [ d,inputObj.l[i], inputObj.o[i], inputObj.c[i],inputObj.h[i] ];
      volumeData[i+1] = [ d, inputObj.v[i] ];
    }
    console.log("return result", data, volumeData)
    return ({data, volumeData});

}

function ExtractExprDays(input) {
    if (input === '' || input === undefined) {
      console.log("bad format of input")
      return;
    }
    var inputObj = input;
    if (inputObj.hasOwnProperty("callExpDateMap") === false) {
        return;
    }
    var mapObj = inputObj.callExpDateMap;
    var expDates = Object.keys(mapObj);
    return expDates;
}
function ExtractStrikes(input, expDate) {
    var inputObj = input;
    if (inputObj.hasOwnProperty("callExpDateMap") === false) {
        return;
    }
    var mapObj = inputObj.callExpDateMap;
    var expDates = Object.keys(mapObj);
    return Object.keys(expDates[expDate]);
}
function ConvertOptionData(input, expDate, optionType, fieldNames) {
    if (input === '' || input === undefined) {
      console.log("bad format of input")
      return [];
    }
    var inputObj = input;
    var mapObj = {}
    if (optionType === 'CALL'){
        if (inputObj.hasOwnProperty("callExpDateMap") === false) {
            return [];
        }else {
             mapObj= inputObj.callExpDateMap;
        }
    }
    else if (optionType === 'PUT'){
        if (inputObj.hasOwnProperty("putExpDateMap") === false) {
            return [];
        }else {
            mapObj = inputObj.putExpDateMap;
        }
    }
    var data = []
    data[0] = fieldNames;

    if (mapObj.hasOwnProperty(expDate) === false){
        return [];
    }
    var strikes = Object.keys(mapObj[expDate]);
    var count = 1;
    for (var p = 0; p < strikes.length;++p) {
        var strike = strikes[p]
        var newObj = [strike]
        var innerObj = mapObj[expDate][strike][0];
        if (p === 0){
            console.log(innerObj);
        }
        for (var j = 1; j < fieldNames.length; ++j){
            var fieldId = fieldNames[j]
            newObj = newObj.concat(innerObj[fieldId]);
        }
        data[count] = newObj;
        count = count+1;
    }
    return data;
}
export {ExtractExprDays}
export {ConvertData};
export {ConvertOptionData};
