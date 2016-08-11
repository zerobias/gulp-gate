"use strict";
const gulp = require('gulp');
const R = require('ramda');
const path = require('path');
const pipe_1 = require('./pipe');
const validmodel_1 = require('./validmodel');
const inspector = require('schema-inspector');
class TaskPreproc {
    static Morph(data) {
        let task = data.task;
        task.name = TaskPreproc.NameFabric(data);
        task.filemask = TaskPreproc.FilemaskFabric(data);
        task.dir = TaskPreproc.DirFabric(data);
        task.taskOpts = TaskPreproc.TaskOptsFabric(data);
        task.pipes = TaskPreproc.PipesFabric(data);
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
class FullTask {
    constructor(subname, taskname, obj) {
        this.subname = subname;
        this.taskname = taskname;
        this.obj = obj;
        this.rendered = false;
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
    static get dest() {
        return gulp.dest('./build/magic');
    }
    get _render() {
        const thisRender = () => {
            let pipes = pipe_1.Pipe.RenderPipeline(this.pipes);
            gulp.task(this.name.full, function () { return pipes.pipe(FullTask.dest); });
            this.rendered = true;
            return pipes;
        };
        const onceRender = R.once(thisRender);
        return onceRender();
    }
    get uid() {
        return this.name.full;
    }
    render() {
        return this._render;
    }
    run() {
        if (!this.rendered)
            this.render();
        return gulp.start([this.name.full]);
    }
}
exports.FullTask = FullTask;
