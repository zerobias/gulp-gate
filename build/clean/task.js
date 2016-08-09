"use strict";
/// <reference path="../typings/index.d.ts" />
const R = require('ramda');
const path = require('path');
const gulpUtil = require('gulp-util');
const inspector = require('schema-inspector');
class TaskPreproc {
    static Morph(data) {
        data.task.name = TaskPreproc.NameFabric(data);
        data.task.filemask = TaskPreproc.FilemaskFabric(data);
        data.task.dir = TaskPreproc.DirFabric(data);
        data.task.taskOpts = TaskPreproc.TaskOptsFabric(data);
        data.task.pipes = TaskPreproc.PipesFabric(data);
    }
    ;
    static NameFabric(data) {
        const makeFullName = (subname, taskname) => [subname, taskname].join(':');
        return {
            short: data.taskname,
            full: makeFullName(data.subname, data.taskname)
        };
    }
    ;
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
        const bool = (def) => {
            return {
                type: 'boolean',
                optional: false,
                def: def };
        };
        const schema = {
            type: 'object',
            properties: {
                protect: bool(true),
                sourceMaps: bool(true),
                notify: bool(false),
                cache: bool(true)
            }
        };
        return inspector.sanitize(schema, R.propOr({}, 'taskOpts', data.obj)).data;
    }
}
TaskPreproc.PipesFabric = (data) => PipeFactory.BatchFabric(data);
class PipeFactory {
    static BatchFabric(data) {
        let obj = data.defpath(['pipe'])(data.obj);
        return R.pipe(R.when(R.or(R.map(R.is, [String, Object])), R.of), R.ifElse(R.is(Array), R.map(PipeFactory.Fabric), _obj => console.error(`Wrong type of ${_obj}`)))(obj);
    }
    static Fabric(pipe) {
        console.log('Fabric');
        switch (typeof pipe) {
            case 'string': return PipeFactory.FabricString(pipe);
            case 'object': return PipeFactory.FabricObject(pipe);
            default: return PipeFactory.FabricNoop();
        }
    }
    static FabricObject(pipe) {
        const isValidPipe = (obj) => inspector.validate({
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
        }, obj).valid;
        if (isValidPipe(pipe))
            return pipe;
        let keys = R.keys(pipe);
        return R.ifElse(R.pipe(R.keys, R.length, R.equals(1)), PipeFactory.FabricKeypair, PipeFactory.FabricNoop)(pipe);
    }
    static FabricKeypair(pipe) {
        return R.pipe(R.toPairs, R.head, R.apply(PipeFactory.Pipe))(pipe);
    }
    static FabricNoop() {
        console.log('FabricNoop');
        return PipeFactory.Pipe(gulpUtil.noop, []);
    }
    static FabricString(pipe) {
        console.log('FabricString');
        const requireString = (str) => ['gulp', str].join('-');
        return PipeFactory.Pipe(require(requireString(pipe)), []);
    }
    static Pipe(loader, opts) {
        return {
            loader: loader,
            opts: opts
        };
    }
}
class FullTask {
    constructor(subname, taskname, obj) {
        this.subname = subname;
        this.taskname = taskname;
        this.obj = obj;
        TaskPreproc.Morph(this.Adapter);
    }
    get Adapter() {
        return {
            taskname: this.taskname,
            subname: this.subname,
            obj: this.obj,
            defpath: R.pathOr(this.taskname),
            task: this
        };
    }
}
exports.FullTask = FullTask;
