/// <reference path="../typings/index.d.ts" />
import * as R from 'ramda';
const Bucker = require('bucker');
const settings = {
    console:{
        colors:true
    }
}

class Logger {
    private static options = settings;
    public logger:any;
    constructor(private modulename:string) {
        this.logger = Bucker.createLogger(Logger.options, modulename, function (err) {
            if (err) console.error('failed loading bucker plugin');
        });
    }
    get log() {
        return this.logger.log;
    }
    get warn() {
        return this.logger.warn;
    }
    get tags():Function {
        return this.logger.tags;
    }
    static initPrint(name:string) {
        let log = new Logger(name);
        log.logger.tags(['module init']).log(`--module ${name}--`);
        return log.logger;
    }
}

export { Logger }; 