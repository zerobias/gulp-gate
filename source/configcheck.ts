/// <reference path="../typings/index.d.ts" />
import * as R from 'ramda';
const inspector = require('schema-inspector');
import * as util from './util';
util.initPrint('config check');
import { Map } from 'typescript';
import { sample as config } from './config-example';
import { FullTask } from './task';

import * as Prop from './package/props-type';

const source = config.source;
const result = config.result;

const propsCheck = Prop.propsType;

class ValidHelper {
    public static NoEmptyString = { type: 'string', minLength: 1 , optional: false};
    public static Bool = { type: 'boolean', optional: false};
    public static pairToName(arr:[String,Object]):Object {
        return R.set(R.lensProp('name'),arr[0],arr[1]);
    }
}

class ResultConfigCheck {
    private static stringCheck = propsCheck([String]);
    private static arrObjCheck = propsCheck([Array, Object]);
    public static resultTabs = (obj: Object) =>
        ResultConfigCheck.arrObjCheck(['dir', 'taskOpts', 'name', 'pipe'])(obj);
    public static ResultCheck = {
        name: ResultConfigCheck.stringCheck([''])
    }
    private static sanit = {
        type: 'object',
        properties: {
            name: {
                type: 'object',
                optional: false,
                properties: {
                    short: ValidHelper.NoEmptyString,
                    full:  ValidHelper.NoEmptyString
                }
            },
            dir: {
                type: 'object',
                optional: false,
                properties: {
                    source: ValidHelper.NoEmptyString,
                    dest:   ValidHelper.NoEmptyString
                }
            },
            taskOpts: {
                type: 'object',
                optional: false,
                properties:{
                    protect:    ValidHelper.Bool,
                    sourceMaps: ValidHelper.Bool,
                    notify:     ValidHelper.Bool,
                    cache:      ValidHelper.Bool
                }
            },
            pipe: {
                type: 'array',
                items: {
                    type: 'object',
                    optional: false,
                    properties:{
                        loader:{ type:['function','string'],optional:false },
                        opts:{ type:'any', optional:true }
                    }
                },
                optional: false
            }
        }
    }
    public static validate = (obj:Object):boolean=>inspector.validate(ResultConfigCheck.sanit,obj).valid;
}
type Task = R.Dictionary<Object|String|Array<any>|Number>;
type Subproject = Map<Task>;
type Project = Map<Subproject>;
class SourceConfig {
    private static sanit = {
        type: 'object',
        properties: {
            '*':{
                type:'object'
            }
        }
    }
    public static splitProjects(obj:Object) {
        let projectMap:Map<any> = new Map<any>();
        R.forEach(e=>projectMap.set(e[0],SourceConfig.childMap(e[1])),R.toPairs(obj));
        return projectMap;
    }
    private static childMap(obj:Object) {
        let childMap = new Map<Object>();
        R.forEach(e=>childMap.set(e[0],e[1]),R.toPairs(obj));
        return childMap;
    }
    public static onEveryTask<T>(project:Project,func:(subname:string,taskname:string,obj:Object)=>T):Project {
        let result = new Map<Object>();
        const createSubproject = (subname:string,taskname:string,task:Object)=>
            R.when(
                ()=>R.not(result.has(subname)),
                    result.set(subname,new Map<Object>()));
        const createTask = (subname:string,taskname:string,task:Object)=>{
            createSubproject(subname,taskname,task);
            console.assert(result.has(subname),`${subname} subtask not created! Task: ${taskname}`);
            return (_func)=>result.get(subname).set(taskname,_func(subname,taskname,task));
        }
        project.forEach(
            (sub:Object,subname:string)=>sub.forEach(
                (task:Object,taskname:string)=>
                    createTask(subname,taskname,task)(func)));
        return result;
    }
    public static ConstructTask = (subname:string,taskname:string,obj:Object)=>
        R.constructN(3,FullTask)(subname,taskname,obj);
}

let projectSplit = SourceConfig.splitProjects(source);
let withNames = SourceConfig.onEveryTask(projectSplit,SourceConfig.ConstructTask);
let styl = withNames.get('client').get('stylus');
// console.log(ResultConfigCheck.validate(result));
// console.log(projectSplit);
console.log(withNames);
console.log(styl.name);
console.log(styl.dir);
console.log(styl.taskOpts);
console.log(styl.pipes);
// console.log(inspector.validate(ResultConfigCheck.sanit,source));

export default {};
