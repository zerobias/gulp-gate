/// <reference path="../typings/index.d.ts" />
import * as R from 'ramda'
const inspector = require('schema-inspector')
// import { Map } from 'typescript'
import { sample as config } from './config-example'
import { FullTask } from './task/task'
import { Projectlist } from './task/project'

import * as Prop from './package/props-type'
import { ValidatorModel } from './task/validmodel'

import * as gulp from 'gulp'

import { Logger } from './logger'
const log = Logger.initPrint('config check')

const source = config.source
const result = config.result

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
type Task = R.Dictionary<Object|String|Array<any>|Number>
type TSubproject = Map<Task>
type TProject = Map<TSubproject>
class SourceConfig {
    public static splitProjects(obj:Object) {
        let projectMap:Map<any> = new Map<any>()
        R.forEach(e=>projectMap.set(e[0],SourceConfig.childMap(e[1])),R.toPairs(obj))
        return projectMap
    }
    private static childMap(obj:Object) {
        let childMap = new Map<Object>()
        R.forEach(e=>childMap.set(e[0],e[1]),R.toPairs(obj))
        return childMap
    }
    public static onEveryTask<T>(project:TProject,func:(subname:string,taskname:string,obj:Object)=>T):TProject {
        let result = new Map<Object>()
        const createSubproject = (subname:string,taskname:string,task:Object)=>
            R.when(
                ()=>R.not(result.has(subname)),
                    result.set(subname,new Map<Object>()))
        const createTask = (subname:string,taskname:string,task:Object)=>{
            createSubproject(subname,taskname,task)
            console.assert(result.has(subname),`${subname} subtask not created! Task: ${taskname}`)
            return (_func)=>result.get(subname).set(taskname,_func(subname,taskname,task))
        }
        project.forEach(
            (sub:Object,subname:string)=>sub.forEach(
                (task:Object,taskname:string)=>
                    createTask(subname,taskname,task)(func)))
        return result
    }
    public static ConstructTask = (subname:string,taskname:string,obj:Object)=>
        R.constructN(3,FullTask)(subname,taskname,obj)
}

let projectSplit = SourceConfig.splitProjects(source)
let withNames = SourceConfig.onEveryTask(projectSplit,SourceConfig.ConstructTask)
let styl:FullTask = withNames.get('client').get('stylus')
// let client:Project = new Project(withNames.get('client').values(),'client')
log.tags(['styl object','pipes']).debug(styl.pipes)
// client.run()
// styl.run()
let conf = Projectlist.configSplitter(source)
console.info(conf)
conf.render()
// conf.run()
log.log(gulp.hasTask('client:stylus'))
log.log(gulp.hasTask('client'))
// console.log(inspector.validate(ResultConfigCheck.sanit,source))

export default {}
