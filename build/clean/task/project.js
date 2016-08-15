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
