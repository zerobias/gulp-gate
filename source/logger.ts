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
        this.logger = Bucker.createLogger(Logger.options, modulename, function (err:Error):void {
            if (err) console.error('failed loading bucker plugin');
        });
    }
    static initPrint(name:string):any {
        let log = new Logger(name);
        log.logger.tags(['module init']).log(`--module ${name}--`);
        return log.logger;
    }
}

export { Logger }; 