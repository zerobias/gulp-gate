"use strict";
/// <reference path="../typings/index.d.ts" />
const util = require('./util');
util.initPrint('relativedir');
class RDir {
    constructor() {
        console.log('RDir created');
    }
}
exports.RDir = RDir;
