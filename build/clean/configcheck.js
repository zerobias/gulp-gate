"use strict";
const R = require('ramda');
const inspector = require('schema-inspector');
const config_example_1 = require('./config-example');
const task_1 = require('./task/task');
const Prop = require('./package/props-type');
const gulp = require('gulp');
const logger_1 = require('./logger');
const log = logger_1.Logger.initPrint('config check');
const source = config_example_1.sample.source;
const result = config_example_1.sample.result;
const propsCheck = Prop.propsType;
class ValidHelper {
    static pairToName(arr) {
        return R.set(R.lensProp('name'), arr[0], arr[1]);
    }
}
ValidHelper.NoEmptyString = { type: 'string', minLength: 1, optional: false };
ValidHelper.Bool = { type: 'boolean', optional: false };
class ResultConfigCheck {
}
ResultConfigCheck.stringCheck = propsCheck([String]);
ResultConfigCheck.arrObjCheck = propsCheck([Array, Object]);
ResultConfigCheck.resultTabs = (obj) => ResultConfigCheck.arrObjCheck(['dir', 'taskOpts', 'name', 'pipe'])(obj);
ResultConfigCheck.ResultCheck = {
    name: ResultConfigCheck.stringCheck([''])
};
ResultConfigCheck.sanit = {
    type: 'object',
    properties: {
        name: {
            type: 'object',
            optional: false,
            properties: {
                short: ValidHelper.NoEmptyString,
                full: ValidHelper.NoEmptyString
            }
        },
        dir: {
            type: 'object',
            optional: false,
            properties: {
                source: ValidHelper.NoEmptyString,
                dest: ValidHelper.NoEmptyString
            }
        },
        taskOpts: {
            type: 'object',
            optional: false,
            properties: {
                protect: ValidHelper.Bool,
                sourceMaps: ValidHelper.Bool,
                notify: ValidHelper.Bool,
                cache: ValidHelper.Bool
            }
        },
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
ResultConfigCheck.validate = (obj) => inspector.validate(ResultConfigCheck.sanit, obj).valid;
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
SourceConfig.sanit = {
    type: 'object',
    properties: {
        '*': {
            type: 'object'
        }
    }
};
SourceConfig.ConstructTask = (subname, taskname, obj) => R.constructN(3, task_1.FullTask)(subname, taskname, obj);
let projectSplit = SourceConfig.splitProjects(source);
let withNames = SourceConfig.onEveryTask(projectSplit, SourceConfig.ConstructTask);
let styl = withNames.get('client').get('stylus');
log.tags(['styl object', 'pipes']).debug(styl.pipes);
const renderPipe = loader => pipable => R.when(R.is(Function), l => pipable.pipe(R.apply(l, loader.opts)))(loader.loader);
const renderPipeline = (pipes) => R.reduce((acc, e) => e(acc), gulp.src('./source/*.styl'), R.map(renderPipe, pipes));
let pipeline = renderPipeline(styl.pipes);
log.log(pipeline);
gulp.task('test', function () { return pipeline.pipe(gulp.dest('./build/magic')); });
gulp.start(['test']);
log.log(gulp.hasTask('test'));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {};
