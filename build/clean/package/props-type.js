"use strict";
/// <reference path="../../typings/index.d.ts" />
var R = require('ramda');
// import { sample as config } from '../config-example';
var f_1 = require('./../f');
var util = require('./../util');
util.initPrint('props type');
var propType = function (types) {
    return function (prop) {
        return function (obj) {
            return f_1.F.any(f_1.F.toInvertMap(f_1.F.toInvertMap(f_1.F.batchApply(R.propIs)(types))(prop))(obj));
        };
    };
};
exports.propType = propType;
var propsType = function (types) { return function (props) { return function (obj) {
    return f_1.F.all(f_1.F.toInvertMap(R.map(propType(types), props))(obj));
}; }; };
exports.propsType = propsType;
