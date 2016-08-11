"use strict";
const R = require('ramda');
const gulpUtil = require('gulp-util');
const util_1 = require('../util');
const validmodel_1 = require('./validmodel');
const loader_1 = require('./loader');
const logger_1 = require('../logger');
const log = logger_1.Logger.initPrint('pipe');
const inspector = require('schema-inspector');
const debugPrintFabric = (name) => log.tags(['fabric type']).log(`==Fabric ${name}==`);
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
        const validPipeMaker = (_pipe) => R.when((e) => R.is(String, e.loader), R.pipe(util_1.reflectLogger((e) => log.debug('loader', loader_1.Loader.require(e.loader))), (e) => Pipe.Pipe(loader_1.Loader.require(e.loader), e.opts)))(_pipe);
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
        let pair = R.toPairs(pipe)[0];
        let getLoader = loader_1.Loader.require(pair[0]);
        return Pipe.Pipe(getLoader, pair[1]);
    }
    static FabricNoop() {
        debugPrintFabric('Noop');
        return Pipe.Pipe(gulpUtil.noop, []);
    }
    static FabricString(pipe) {
        debugPrintFabric('String');
        log.debug(loader_1.Loader.require(pipe));
        return Pipe.Pipe(loader_1.Loader.require(pipe), []);
    }
    static Pipe(loader, opts) {
        debugPrintFabric('Pipe');
        return {
            loader: loader,
            opts: Pipe.isntArray(opts)
        };
    }
}
Pipe.isntArray = R.when(R.pipe(R.is(Array), R.not), R.of);
exports.Pipe = Pipe;
