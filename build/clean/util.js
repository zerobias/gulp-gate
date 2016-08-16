"use strict";
const R = require('ramda');
const reflectLogger = logger => object => {
    logger(object);
    return object;
};
exports.reflectLogger = reflectLogger;
const makeArrayIfIsnt = R.when(R.pipe(R.is(Array), R.not), R.of);
exports.makeArrayIfIsnt = makeArrayIfIsnt;
