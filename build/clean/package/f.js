"use strict";
const R = require('ramda');
class F {
}
F.applyTo = (e) => (passed) => e(passed);
F.applyThis = (passed) => (e) => e(passed);
F.invertMap = (list) => R.map(F.applyTo, list);
F.toInvertMap = (list) => (passed) => R.map(F.applyThis(passed), list);
F.invertMapApply = func => R.pipe(R.map(func), F.invertMap);
F.reflector = (e) => () => e;
F.boolReducer = (func, init) => (arr) => R.reduce(func, init, arr);
F.any = F.boolReducer(R.or, false);
F.all = F.boolReducer(R.and, true);
F.batchApply = (func) => (arr) => R.map(func, arr);
exports.F = F;
