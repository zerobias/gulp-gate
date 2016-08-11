"use strict";
const R = require('ramda');
const initPrint = (name) => console.log(`--module ${name}--`);
exports.initPrint = initPrint;
const reflectLogger = logger => object => {
    logger(object);
    return object;
};
exports.reflectLogger = reflectLogger;
const isntArray = R.when(R.pipe(R.is(Array), R.not), R.of);
exports.isntArray = isntArray;
