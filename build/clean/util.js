"use strict";
const initPrint = (name) => console.log(`--module ${name}--`);
exports.initPrint = initPrint;
const reflectLogger = logger => object => {
    logger(object);
    return object;
};
exports.reflectLogger = reflectLogger;
