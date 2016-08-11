"use strict";
const R = require('ramda');
const gulp = require('gulp');
const task_1 = require('./task');
class Projectlist {
    constructor(list) {
        this.list = list;
        this.rendered = false;
    }
    static configSplitter(obj) {
        const pairToTask = (pair) => R.apply(Project.configSplitter, pair);
        const toPairs = R.toPairs(obj);
        let tasklist = R.map(pairToTask)(toPairs);
        return new Projectlist(tasklist);
    }
    get _render() {
        const thisRender = () => {
            this.list.forEach(e => e.render());
            this.rendered = true;
        };
        const onceRender = R.once(thisRender);
        return onceRender;
    }
    render() {
        return this._render();
    }
    run() {
        if (!this.rendered)
            this.render();
        this.list.forEach(e => e.run());
    }
    get(projectname) {
        return R.find((e) => e.uid === projectname)(this.list);
    }
}
exports.Projectlist = Projectlist;
class Project {
    constructor(list, uid) {
        this.list = list;
        this.uid = uid;
        this.rendered = false;
    }
    static configSplitter(projectname, obj) {
        const pairToTask = (pair) => new task_1.FullTask(projectname, pair[0], pair[1]);
        const toPairs = R.toPairs(obj);
        let tasklist = R.map(pairToTask)(toPairs);
        return new Project(tasklist, projectname);
    }
    get _render() {
        const thisRender = () => {
            this.list.forEach(e => e.render());
            this.rendered = true;
            gulp.task(this.uid, Project.childNames(this));
        };
        const onceRender = R.once(thisRender);
        return onceRender;
    }
    render() {
        return this._render();
    }
    run() {
        if (!this.rendered)
            this.render();
        return gulp.start([this.uid]);
    }
    get(taskname) {
        return R.find((e) => e.name.short === taskname)(this.list);
    }
}
Project.childNames = (obj) => R.map((e) => e.uid)(obj.list);
exports.Project = Project;
