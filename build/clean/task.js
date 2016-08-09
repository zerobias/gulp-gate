"use strict";
/// <reference path="../typings/index.d.ts" />
const R = require('ramda');
const path = require('path');
const inspector = require('schema-inspector');
class TaskPreproc {
    static Morph(data) {
        data.task.name = TaskPreproc.NameFabric(data);
        data.task.filemask = TaskPreproc.FilemaskFabric(data);
        data.task.dir = TaskPreproc.DirFabric(data);
        data.task.taskOpts = TaskPreproc.TaskOptsFabric(data);
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
