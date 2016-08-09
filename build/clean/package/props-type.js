"use strict";
/// <reference path="../../typings/index.d.ts" />
const R = require('ramda');
// import { sample as config } from '../config-example';
const f_1 = require('./../f');
const util = require('./../util');
util.initPrint('props type');
let propType = (types) => (prop) => (obj) => f_1.F.any(f_1.F.toInvertMap(f_1.F.toInvertMap(f_1.F.batchApply(R.propIs)(types))(prop))(obj));
exports.propType = propType;
const propsType = (types) => (props) => (obj) => f_1.F.all(f_1.F.toInvertMap(R.map(propType(types), props))(obj));
exports.propsType = propsType;
