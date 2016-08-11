"use strict";
const R = require('ramda');
const gulpUtil = require('gulp-util');
const resolve = require('resolve');
const util_1 = require('./util');
const validmodel_1 = require('./validmodel');
const logger_1 = require('./logger');
const log = logger_1.Logger.initPrint('pipe').logger;
const inspector = require('schema-inspector');
const debugPrintFabric = (name) => log.tags(['fabric type']).log(`==Fabric ${name}==`);
class Loader {
    static require(loader) {
        return R.when(R.is(String), R.pipe(Loader.resolveString, require))(loader);
    }
    static resolveString(loader) {
        const requireString = (str) => ['gulp', str].join('-');
        const whenNoPrefix = R.ifElse(R.pipe(R.head, R.equals('^'), R.not), requireString, R.tail);
        return Loader.syncLoad(whenNoPrefix(loader));
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
        return _module;
    }
}
class Pipe {
    static BatchFabric(data) {
        let obj = data.defpath(['pipe'])(data.obj);
        const isArray = R.when(R.is(Array), Pipe.FabricArray);
        const isInsideArray = R.pipe(R.head, R.is(Array));
        log.tags(['pipeFactory', 'batch', 'pipes[0]']).log(obj[0]);
        log.tags(['pipeFactory', 'batch', 'is array?']).log(isArray(obj));
        return isArray(obj);
    }
    static Fabric(pipe) {
        debugPrintFabric('simple');
        switch (typeof pipe) {
            case 'string': return Pipe.FabricString(pipe);
            case 'object': return Pipe.FabricObject(pipe);
            default: return Pipe.FabricNoop();
        }
    }
    static FabricArray(pipe) {
        debugPrintFabric('Array');
        return R.map(Pipe.FabricObject, pipe);
    }
    static FabricObject(pipe) {
        debugPrintFabric('Object');
        const isValidPipe = (obj) => inspector.validate(validmodel_1.ValidatorModel.Pipe, obj).valid;
        const validPipeMaker = (_pipe) => R.when((e) => R.is(String, e.loader), R.pipe(util_1.reflectLogger((e) => log.debug('loader', Loader.require(e.loader))), (e) => Pipe.Pipe(Loader.require(e.loader), e.opts)))(_pipe);
        let keys = R.keys(pipe);
        log.tags(['pipe', 'keys', 'values']).log(`---------keys length ${keys.length} ${keys} ${R.values(pipe)}`);
        return R.cond([
            [R.pipe(R.keys, R.length, R.equals(1)), Pipe.FabricKeypair],
            [isValidPipe, validPipeMaker],
            [R.is(String), Pipe.FabricString],
            [R.T, Pipe.FabricNoop]
        ])(pipe);
    }
    static FabricKeypair(pipe) {
        debugPrintFabric('Keypair');
        return R.apply(Pipe.Pipe, R.toPairs(pipe)[0]);
    }
    static FabricNoop() {
        debugPrintFabric('Noop');
        return Pipe.Pipe(gulpUtil.noop, []);
    }
    static FabricString(pipe) {
        debugPrintFabric('String');
        log.debug(pipe);
        return Pipe.Pipe(pipe, []);
    }
    static Pipe(loader, opts) {
        debugPrintFabric('Pipe');
        let _loader = null;
        if (!R.is(String, loader)) {
            try {
                _loader = Loader.require(loader);
            }
            catch (e) {
                log.error(`Fabric pipe error! loader ${loader} ${e.name} ${e.message}`);
            }
        }
        else {
            _loader = loader;
        }
        return {
            loader: _loader,
            opts: Pipe.isntArray(opts)
        };
    }
}
Pipe.isntArray = R.when(R.pipe(R.is(Array), R.not), R.of);
exports.Pipe = Pipe;
