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
