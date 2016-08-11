"use strict";
const inspector = require('schema-inspector');
const config_example_1 = require('./config-example');
const project_1 = require('./task/project');
const Prop = require('./package/props-type');
const validmodel_1 = require('./task/validmodel');
const gulp = require('gulp');
const logger_1 = require('./logger');
const log = logger_1.Logger.initPrint('config check');
const source = config_example_1.sample.source;
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
let conf = project_1.Projectlist.configSplitter(source);
conf.render();
conf.get('client').run();
log.log(gulp.hasTask('client:stylus'));
log.log(gulp.hasTask('client'));
console.info(conf);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {};
