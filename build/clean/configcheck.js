"use strict";
const R = require('ramda');
const inspector = require('schema-inspector');
const config_example_1 = require('./config-example');
const task_1 = require('./task/task');
const project_1 = require('./task/project');
const Prop = require('./package/props-type');
const validmodel_1 = require('./task/validmodel');
const gulp = require('gulp');
const logger_1 = require('./logger');
const log = logger_1.Logger.initPrint('config check');
const source = config_example_1.sample.source;
const result = config_example_1.sample.result;
const propsCheck = Prop.propsType;
class ResultConfigCheck {
}
ResultConfigCheck.stringCheck = propsCheck([String]);
ResultConfigCheck.arrObjCheck = propsCheck([Array, Object]);
ResultConfigCheck.resultTabs = (obj) => ResultConfigCheck.arrObjCheck(['dir', 'taskOpts', 'name', 'pipe'])(obj);
ResultConfigCheck.ResultCheck = {
    name: ResultConfigCheck.stringCheck([''])
};
ResultConfigCheck.validate = (obj) => inspector.validate(validmodel_1.ValidatorModel.ResultConfig, obj).valid;
class SourceConfig {
    static splitProjects(obj) {
        let projectMap = new Map();
        R.forEach(e => projectMap.set(e[0], SourceConfig.childMap(e[1])), R.toPairs(obj));
        return projectMap;
    }
    static childMap(obj) {
        let childMap = new Map();
        R.forEach(e => childMap.set(e[0], e[1]), R.toPairs(obj));
        return childMap;
    }
    static onEveryTask(project, func) {
        let result = new Map();
        const createSubproject = (subname, taskname, task) => R.when(() => R.not(result.has(subname)), result.set(subname, new Map()));
        const createTask = (subname, taskname, task) => {
            createSubproject(subname, taskname, task);
            console.assert(result.has(subname), `${subname} subtask not created! Task: ${taskname}`);
            return (_func) => result.get(subname).set(taskname, _func(subname, taskname, task));
        };
        project.forEach((sub, subname) => sub.forEach((task, taskname) => createTask(subname, taskname, task)(func)));
        return result;
    }
}
SourceConfig.ConstructTask = (subname, taskname, obj) => R.constructN(3, task_1.FullTask)(subname, taskname, obj);
let projectSplit = SourceConfig.splitProjects(source);
let withNames = SourceConfig.onEveryTask(projectSplit, SourceConfig.ConstructTask);
let styl = withNames.get('client').get('stylus');
log.tags(['styl object', 'pipes']).debug(styl.pipes);
let conf = project_1.Projectlist.configSplitter(source);
console.info(conf);
conf.render();
log.log(gulp.hasTask('client:stylus'));
log.log(gulp.hasTask('client'));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {};
