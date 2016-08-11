"use strict";
const R = require('ramda');
const resolve = require('resolve');
const util = require('gulp-util');
const logger_1 = require('../logger');
const log = logger_1.Logger.initPrint('loader');
class Loader {
    static require(_loader) {
        return Loader.tryCatchRequire(_loader, R.when(R.is(String), Loader.resolveString));
    }
    static tryCatchRequire(_loader, func) {
        let req = null;
        try {
            req = func(_loader);
        }
        catch (e) {
            log.error(`Loader.tryCatchRequire error! loader ${_loader} ${e.name} ${e.message}`);
            req = util.noop;
        }
        return req;
    }
    static resolveString(_loader) {
        const prependWord = add => str => R.pipe(R.of, R.prepend(add), R.join('-'))(str);
        const isWithPrefix = R.ifElse(R.pipe(R.head, R.equals('^')), R.tail, prependWord('gulp'));
        let resolved = Loader.syncLoad(isWithPrefix(_loader));
        return R.ifElse(R.isNil, () => util.noop, require)(resolved);
    }
    static asyncLoad(moduleName) {
        const asyncCallback = function (err, res) {
            if (err)
                console.error(err);
            else
                log.tags(['async load info']).info(res);
            return res;
        };
        return resolve(moduleName, { basedir: __dirname }, asyncCallback);
    }
    static syncLoad(moduleName) {
        let _module = null;
        try {
            _module = resolve.sync(moduleName, { basedir: __dirname });
        }
        catch (e) {
            log.error(`Sync load module error! ${e.name} ${e.message}`);
        }
        finally {
            return _module;
        }
    }
}
exports.Loader = Loader;
