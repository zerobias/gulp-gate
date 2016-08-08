"use strict";
/// <reference path="../typings/index.d.ts" />
var R = require('ramda');
var util = require('./util');
util.initPrint('props checking');
var printer = function (message) { return function (obj) { console.log(obj); return obj; }; };
var revertApply = function (prop) { return function (func) { return func(prop); }; };
var simpleApply = function (func) { return function (prop) { return func(prop); }; };
var mapFuncApply = function (list) { return function (func) { return R.map(func)(list); }; };
var funcMapApply = function (func) { return function (list) { return R.map(func)(list); }; };
var recFuncMap = function () {
    var funcs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        funcs[_i - 0] = arguments[_i];
    }
    return mapFuncApply(funcs)(funcMapApply);
};
var recursiveFuncMap = function () {
    var funcs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        funcs[_i - 0] = arguments[_i];
    }
    return function (list) { return R.apply(R.pipe, recFuncMap(printer('funcs')(funcs)))(printer('list')(list)); };
};
var enabledType = [Object, Array];
var isObjPropPass = function (types) {
    return function (obj) { return function (propname) {
        return R.anyPass(recursiveFuncMap(R.propIs, revertApply(propname))(types))(obj);
    }; };
};
var isObjPropAoO = isObjPropPass(enabledType);
exports.func = isObjPropAoO;
