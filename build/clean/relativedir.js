"use strict";
/// <reference path="../typings/index.d.ts" />
var util = require('./util');
util.initPrint('relativedir');
var RDir = (function () {
    function RDir() {
        console.log('RDir created');
    }
    return RDir;
}());
exports.RDir = RDir;
