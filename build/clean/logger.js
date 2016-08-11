"use strict";
const Bucker = require('bucker');
const settings = {
    console: {
        colors: true
    }
};
class Logger {
    constructor(modulename) {
        this.modulename = modulename;
        this.logger = Bucker.createLogger(Logger.options, modulename, function (err) {
            if (err)
                console.error('failed loading bucker plugin');
        });
    }
    get log() {
        return this.logger.log;
    }
    get warn() {
        return this.logger.warn;
    }
    get tags() {
        return this.logger.tags;
    }
    static initPrint(name) {
        let log = new Logger(name);
        log.logger.tags(['module init']).log(`--module ${name}--`);
        return log.logger;
    }
}
Logger.options = settings;
exports.Logger = Logger;
