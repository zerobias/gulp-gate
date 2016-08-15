(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.gulpGate = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"bucker":undefined}],2:[function(require,module,exports){
(function (__dirname){
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

}).call(this,"/_projects\\Web\\gulp-gate\\build\\clean\\task")
},{"../logger":1,"gulp-util":undefined,"ramda":undefined,"resolve":undefined}],3:[function(require,module,exports){
"use strict";
const R = require('ramda');
const gulp = require('gulp');
const gulpUtil = require('gulp-util');
const util_1 = require('../util');
const util_2 = require('../util');
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
            opts: util_2.makeArrayIfIsnt(opts)
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
        const validPipeMaker = (_pipe) => R.when((e) => R.is(String, e.loader), R.pipe(util_1.reflectLogger((e) => log.debug('loader', loader_1.Loader.require(e.loader))), (e) => Pipe.Pipe(loader_1.Loader.require(e.loader), e.opts)))(_pipe);
        const isExactlyOneKey = R.pipe(R.keys, R.length, R.equals(1));
        logKeys(pipe);
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
Pipe.RenderPipeline_deprecated = (pipeline) => R.reduce((acc, e) => e(acc), gulp.src('./source/*.styl'), R.map(Pipe.RenderPipe, pipeline));
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

},{"../logger":1,"../util":7,"./loader":2,"./validmodel":6,"gulp":undefined,"gulp-util":undefined,"ramda":undefined,"schema-inspector":undefined}],4:[function(require,module,exports){
"use strict";
const R = require('ramda');
const gulp = require('gulp');
const task_1 = require('./task');
const childNames = (obj) => R.pluck('uid')(obj.list);
class ObjectSplitter {
}
ObjectSplitter.toPairs = R.toPairs;
ObjectSplitter.tasklist = (construct) => R.pipe(ObjectSplitter.toPairs, R.map(construct));
ObjectSplitter.pairToProject = (pair) => R.apply(Project.configSplitter, pair);
ObjectSplitter.pairToTask = projectname => (pair) => new task_1.FullTask(projectname, pair[0], pair[1]);
ObjectSplitter.splitProjectlist = (obj) => new Projectlist(ObjectSplitter.tasklist(ObjectSplitter.pairToProject)(obj));
ObjectSplitter.splitProject = (obj, projectname) => new Project(ObjectSplitter.tasklist(ObjectSplitter.pairToTask(projectname))(obj), projectname);
class Renderable {
    constructor(list, uid) {
        this.list = list;
        this.uid = uid;
        this.rendered = false;
    }
    render() {
        let self = this;
        const thisRender = function () {
            self.list.forEach(e => e.render());
            self.rendered = true;
            gulp.task(self.uid, childNames(self));
        };
        if (!self.rendered)
            thisRender();
    }
    run() {
        this.render();
        return gulp.start([this.uid]);
    }
}
class Projectlist extends Renderable {
    constructor(list) {
        super(list, 'build-all');
        this.list = list;
    }
    get(projectname) {
        return R.find((e) => e.uid === projectname)(this.list);
    }
}
Projectlist.configSplitter = (obj) => ObjectSplitter.splitProjectlist(obj);
exports.Projectlist = Projectlist;
class Project extends Renderable {
    constructor(list, uid) {
        super(list, uid);
        this.list = list;
        this.uid = uid;
    }
    get(taskname) {
        return (R.find((e) => e.name.short === taskname)(this.list)).UserAdapter;
    }
}
Project.configSplitter = (projectname, obj) => ObjectSplitter.splitProject(obj, projectname);
exports.Project = Project;

},{"./task":5,"gulp":undefined,"ramda":undefined}],5:[function(require,module,exports){
"use strict";
const gulp = require('gulp');
const R = require('ramda');
const path = require('path');
const pipe_1 = require('./pipe');
const pipe_2 = require('./pipe');
const validmodel_1 = require('./validmodel');
const logger_1 = require('../logger');
const log = logger_1.Logger.initPrint('task');
const inspector = require('schema-inspector');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
class TaskPreproc {
    static Morph(data) {
        let task = data.task;
        task.name = TaskPreproc.NameFabric(data);
        task.filemask = TaskPreproc.FilemaskFabric(data);
        task.dir = TaskPreproc.DirFabric(data);
        task.taskOpts = TaskPreproc.TaskOptsFabric(data);
        task.list = TaskPreproc.PipesFabric(data);
    }
    static NameFabric(data) {
        const makeFullName = (subname, taskname) => [subname, taskname].join(':');
        return {
            short: data.taskname,
            full: makeFullName(data.subname, data.taskname)
        };
    }
    static pathMaker(dirs) {
        return R.pipe(R.prepend(process.cwd()), R.apply(path.join))(dirs);
    }
    static FilemaskFabric(data) {
        let ext = data.defpath(['include', 'ext']);
        let filename = (_ext, name) => [name ? name : '*', _ext].join('.');
        let deep = R.pathOr(false, ['include', 'deep']);
        let result = R.pipe(ext, filename, R.of);
        return R.ifElse(deep, R.pipe(result, R.prepend('**')), result)(data.obj);
    }
    static DirFabric(data) {
        let defPath = (target) => data.defpath(['dir', target])(data.obj);
        let pathArray = (target, targetFolder) => [
            targetFolder
                ? targetFolder
                : target,
            data.subname,
            defPath(target)
        ];
        return {
            source: TaskPreproc.pathMaker(R.concat(pathArray('source'), data.task.filemask)),
            dest: TaskPreproc.pathMaker(pathArray('dest', 'build'))
        };
    }
    static TaskOptsFabric(data) {
        return inspector.sanitize(validmodel_1.ValidatorModel.TaskOpts, R.propOr({}, 'taskOpts', data.obj)).data;
    }
}
TaskPreproc.PipesFabric = (data) => pipe_1.Pipe.BatchFabric(data);
class PipelinePreproc {
    static Morph(task) {
        task.list = PipelinePreproc.addMaps(task);
        task.list = PipelinePreproc.addProtect(task);
        task.list = PipelinePreproc.addSrcDest(task);
    }
    static addSrcDest(task) {
        const isDestExists = (_task) => R.or(R.not(R.isNil(_task.dir.dest)), R.equals(false, _task.dir.dest));
        const getSrc = (_task) => pipe_1.Pipe.Pipe(gulp.src, [_task.dir.source]);
        const getDest = (_task) => pipe_1.Pipe.Pipe(gulp.dest, [_task.dir.dest]);
        const adder = function (task) {
            let isDest = isDestExists(task);
            let src = getSrc(task);
            let dest = () => getDest(task);
            const add = isDest
                ? pipe_2.Pipeliner.enclose(src, dest())
                : pipe_2.Pipeliner.append(src);
            return R.pipe(PipelinePreproc.list, add)(task);
        };
        return adder(task);
    }
    static get list() {
        return R.prop('list');
    }
    static addProtect(task) {
        return R.ifElse(R.path(['TaskOpts', 'protect']), R.pipe(PipelinePreproc.list, pipe_2.Pipeliner.prepend(pipe_1.Pipe.Pipe(plumber, []))), PipelinePreproc.list)(task);
    }
    static addMaps(task) {
        return R.ifElse(R.path(['taskOpts', 'sourceMaps']), R.pipe(PipelinePreproc.list, pipe_2.Pipeliner.enclose(pipe_1.Pipe.Pipe(sourcemaps.init, []), pipe_1.Pipe.Pipe(sourcemaps.write, ['.']))), PipelinePreproc.list)(task);
    }
}
class FullTask {
    constructor(subname, taskname, obj) {
        this.subname = subname;
        this.taskname = taskname;
        this.obj = obj;
        this.rendered = false;
        TaskPreproc.Morph(this.PreprocessAdapter);
        PipelinePreproc.Morph(this);
    }
    get PreprocessAdapter() {
        return {
            taskname: this.taskname,
            subname: this.subname,
            obj: this.obj,
            defpath: R.pathOr(this.taskname),
            task: this
        };
    }
    get UserAdapter() {
        return {
            task: this.name.short,
            uid: this.name.full,
            project: this.subname,
            render: this.render,
            run: this.run
        };
    }
    get uid() {
        return this.name.full;
    }
    render() {
        let self = this;
        let thisRender = function () {
            let pipes = pipe_2.Pipeliner.render(self.list);
            gulp.task(self.name.full, function () { return pipes; });
            self.rendered = true;
            return pipes;
        };
        this.list.forEach(e => log.info(`----------------loader ${e.loader} opts ${e.opts}`));
        if (!this.rendered)
            thisRender();
    }
    run() {
        this.render();
        return gulp.start([this.name.full]);
    }
}
exports.FullTask = FullTask;

},{"../logger":1,"./pipe":3,"./validmodel":6,"gulp":undefined,"gulp-plumber":undefined,"gulp-sourcemaps":undefined,"path":undefined,"ramda":undefined,"schema-inspector":undefined}],6:[function(require,module,exports){
"use strict";
class ValidatorModel {
    static BoolDef(def) {
        return {
            type: 'boolean',
            optional: false,
            def: def
        };
    }
    static get NoEmptyString() {
        return {
            type: 'string',
            minLength: 1,
            optional: false
        };
    }
    static get TaskOpts() {
        const bool = ValidatorModel.BoolDef;
        return {
            type: 'object',
            properties: {
                protect: bool(true),
                sourceMaps: bool(true),
                notify: bool(false),
                cache: bool(true),
                cleanBefore: bool(false)
            }
        };
    }
    static get Pipe() {
        return {
            type: 'object',
            optional: false,
            properties: {
                loader: { type: ['function', 'string'], optional: false },
                opts: { type: 'any', optional: true }
            }
        };
    }
    static get PipeArray() {
        return {
            type: 'array',
            items: ValidatorModel.Pipe,
            optional: false
        };
    }
    static get ResultConfig() {
        return {
            type: 'object',
            properties: {
                name: {
                    type: 'object',
                    optional: false,
                    properties: {
                        short: ValidatorModel.NoEmptyString,
                        full: ValidatorModel.NoEmptyString
                    }
                },
                dir: {
                    type: 'object',
                    optional: false,
                    properties: {
                        source: ValidatorModel.NoEmptyString,
                        dest: ValidatorModel.NoEmptyString
                    }
                },
                taskOpts: ValidatorModel.TaskOpts,
                pipe: {
                    type: 'array',
                    items: {
                        type: 'object',
                        optional: false,
                        properties: {
                            loader: { type: ['function', 'string'], optional: false },
                            opts: { type: 'any', optional: true }
                        }
                    },
                    optional: false
                }
            }
        };
    }
}
exports.ValidatorModel = ValidatorModel;

},{}],7:[function(require,module,exports){
"use strict";
const R = require('ramda');
const initPrint = (name) => console.log(`--module ${name}--`);
exports.initPrint = initPrint;
const reflectLogger = logger => object => {
    logger(object);
    return object;
};
exports.reflectLogger = reflectLogger;
const makeArrayIfIsnt = R.when(R.pipe(R.is(Array), R.not), R.of);
exports.makeArrayIfIsnt = makeArrayIfIsnt;

},{"ramda":undefined}],8:[function(require,module,exports){
"use strict";
const project_1 = require('./project');
const config = function (obj) {
    let list = project_1.Projectlist.configSplitter(obj);
    list.render();
    return {
        run: () => list.run(),
        get: (projectname) => list.get(projectname)
    };
};
module.exports = config;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = config;

},{"./project":4}]},{},[8])(8)
});