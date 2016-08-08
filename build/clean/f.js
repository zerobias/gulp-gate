"use strict";
/// <reference path="../typings/index.d.ts" />
var R = require('ramda');
var F = (function () {
    function F() {
    }
    F.applyTo = function (e) { return function (passed) { return e(passed); }; };
    F.applyThis = function (passed) { return function (e) { return e(passed); }; };
    F.invertMap = function (list) { return R.map(F.applyTo, list); };
    F.toInvertMap = function (list) { return function (passed) {
        return R.map(F.applyThis(passed), list);
    }; };
    F.invertMapApply = function (func) { return R.pipe(R.map(func), F.invertMap); };
    F.reflector = function (e) { return function () { return e; }; };
    F.boolReducer = function (func, init) {
        return function (arr) { return R.reduce(func, init, arr); };
    };
    F.any = F.boolReducer(R.or, false);
    F.all = F.boolReducer(R.and, true);
    F.batchApply = function (func) { return function (arr) { return R.map(func, arr); }; };
    return F;
}());
exports.F = F;
