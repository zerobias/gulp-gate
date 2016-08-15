/// <reference path="../typings/index.d.ts" />
// import * as R from 'ramda'
const inspector = require('schema-inspector')
// import { Map } from 'typescript'
import { sample as config } from './config-example'
// import { FullTask } from './task/task'
import { Projectlist } from './task/project'

import * as Prop from './package/props-type'
import { ValidatorModel } from './task/validmodel'

import * as gulp from 'gulp'

import { Logger } from './logger'
const log = Logger.initPrint('config check')

const source = config.source
// const result = config.result

const propsCheck = Prop.propsType

class ResultConfigCheck {
    private static stringCheck = propsCheck([String])
    private static arrObjCheck = propsCheck([Array, Object])
    public static resultTabs = (obj: Object) =>
        ResultConfigCheck.arrObjCheck(['dir', 'taskOpts', 'name', 'pipe'])(obj);
    public static ResultCheck = {
        name: ResultConfigCheck.stringCheck([''])
    }
    public static validate = (obj:Object):boolean=>inspector.validate(ValidatorModel.ResultConfig,obj).valid
}

// client.run()
// styl.run()
let conf = Projectlist.configSplitter(source)
conf.render()
conf.get('client').run()
const hasTask = taskname=>log.log(`gulp has task ${taskname}`,gulp.hasTask(taskname))
hasTask('client:stylus')
hasTask('client')
hasTask('build-all')

console.info(conf)
// console.log(inspector.validate(ResultConfigCheck.sanit,source))

export default {}
