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
        log.tags(['pipeFactory', 'batch', 'pipes[0]']).log(obj[0]);
        log.tags(['pipeFactory', 'batch', 'is array?']).log(isArray(obj));
        return isArray(obj);
    }
    static Pipe(loader, opts) {
        debugPrintFabric('Pipe');
        return {
            loader: loader,
            opts: util_1.makeArrayIfIsnt(opts)
        };
    }
    static FabricArray(pipe) {
        debugPrintFabric('Array');
        return R.map(Pipe.FabricObject, pipe);
    }
    static FabricObject(pipe) {
        debugPrintFabric('Object');
        let logKeys = _pipe => {
            let keys = R.keys(_pipe);
            log.tags(['pipe', 'keys', 'values']).log(`---------keys length ${keys.length} ${keys} ${R.values(_pipe)}`);
        };
        const isValidPipe = (obj) => inspector.validate(validmodel_1.ValidatorModel.Pipe, obj).valid;
        const validPipeMaker = (_pipe) => R.when((e) => R.is(String, e.loader), R.pipe((e) => Pipe.Pipe(loader_1.Loader.require(e.loader), e.opts)))(_pipe);
        const isExactlyOneKey = R.pipe(R.keys, R.length, R.equals(1));
        return R.cond([
            [isExactlyOneKey, Pipe.FabricKeypair],
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
        let resolved = loader_1.Loader.require(pipe);
        log.debug(resolved);
        return Pipe.Pipe(resolved, []);
    }
}
Pipe.RenderPipe = (pipe) => (pipable) => R.when(R.is(Function), l => pipable.pipe(R.apply(l, pipe.opts)))(pipe.loader);
Pipe.RenderFirstPipe = (pipe) => R.when(R.is(Function), l => R.apply(l, pipe.opts))(pipe.loader);
exports.Pipe = Pipe;
class Pipeliner {
}
Pipeliner.append = (pipe) => (line) => R.append(pipe, line);
Pipeliner.prepend = (pipe) => (line) => R.prepend(pipe, line);
Pipeliner.enclose = (prepend, append) => (line) => R.pipe(Pipeliner.prepend(prepend), Pipeliner.append(append))(line);
Pipeliner.render = (line) => {
    let head = R.head(line);
    let tail = R.tail(line);
    return R.reduce((acc, e) => e(acc), Pipe.RenderFirstPipe(head), R.map(Pipe.RenderPipe, tail));
};
exports.Pipeliner = Pipeliner;
