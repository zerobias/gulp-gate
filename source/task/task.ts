/// <reference path="../../typings/index.d.ts" />
import * as gulp from 'gulp'
import * as R    from 'ramda'
import * as path from 'path'

import { Pipe as PipeFactory }  from './pipe'
import { IPipe }                from './pipe'
import { ValidatorModel }       from './validmodel'
import { Task }                 from './header'

// import { Logger }               from '../logger'
// const log = Logger.initPrint('task')

const inspector = require('schema-inspector')

// import { F } from './f';

interface ITaskName extends R.Dictionary<string> {
    short:string,
    full:string
}
interface ITaskDir extends R.Dictionary<string> {
    source:string,
    dest:string
}
interface ITaskOpts extends R.Dictionary<boolean> {
    protect:boolean,
    sourceMaps:boolean,
    notify:boolean,
    cache:boolean
}

type Filemask = string[]

class TaskPreproc {
    public static Morph(data:Task.ITaskAdapter):void {
        let task = (<IJustTask>data).task
        task.name = TaskPreproc.NameFabric(data)
        task.filemask = TaskPreproc.FilemaskFabric(data)
        task.dir = TaskPreproc.DirFabric(data)
        task.taskOpts = TaskPreproc.TaskOptsFabric(data)
        task.pipes = TaskPreproc.PipesFabric(data)
    }
    private static NameFabric(data:Task.ITaskAdapter):ITaskName {
        const makeFullName = (subname:string,taskname:string)=>[subname,taskname].join(':')
        return {
            short:data.taskname,
            full:makeFullName(data.subname,data.taskname)
        }
    }
    private static pathMaker(dirs:string[]):string {
        return R.pipe(R.prepend(process.cwd()),R.apply(path.join))(dirs)
    }
    private static FilemaskFabric(data:Task.ITaskAdapter):string[] {
        let ext = data.defpath(['include','ext'])
        let filename = (_ext:string,name?:string)=>[name?name:'*',_ext].join('.')
        let deep = R.pathOr(false,['include','deep'])
        let result = R.pipe(ext,filename,R.of)
        return R.ifElse(deep,R.pipe(result,R.prepend('**')),result)(data.obj)
    }
    private static DirFabric(data:Task.ITaskAdapter):ITaskDir {
        let defPath = (target:string)=>data.defpath(['dir',target])(data.obj)
        let pathArray = (target:string,targetFolder?:string)=>[
            targetFolder
                ?targetFolder
                :target,
            data.subname,
            defPath(target)
        ]
        return {
            source:TaskPreproc.pathMaker(R.concat(pathArray('source'),data.task.filemask)),
            dest:TaskPreproc.pathMaker(pathArray('dest','build'))
        }
    }
    private static TaskOptsFabric(data:Task.ITaskAdapter):ITaskOpts {
        return inspector.sanitize(ValidatorModel.TaskOpts,R.propOr({},'taskOpts',data.obj)).data
    }
    private static PipesFabric = (data:Task.ITaskAdapter):IPipe[]=>PipeFactory.BatchFabric(data)
}
interface IJustTask {
    task?:FullTask
}
class FullTask {
    public name:ITaskName
    public dir :ITaskDir
    public filemask: string[]
    public taskOpts: ITaskOpts
    public pipes: IPipe[]
    private rendered:boolean = false
    constructor(public subname:string,public taskname:string,public obj:Object) {
        TaskPreproc.Morph(this.Adapter)
    }
    private get Adapter():Task.ITaskAdapter {
        return {
            taskname:this.taskname,
            subname:this.subname,
            obj:this.obj,
            defpath:R.pathOr(this.taskname),
            task:this
        }
    }
    private static get dest():NodeJS.ReadWriteStream {
        return gulp.dest('./build/magic')
    }
    private get _render():NodeJS.ReadWriteStream {
        const thisRender = ()=> {
            let pipes = PipeFactory.RenderPipeline(this.pipes)
            gulp.task(this.name.full,function():NodeJS.ReadWriteStream {return pipes.pipe(FullTask.dest)})
            this.rendered = true
            return pipes
        }
        const onceRender = R.once(thisRender)
        return onceRender()
    }
    public get uid():string {
        return this.name.full
    }
    public render():NodeJS.ReadWriteStream {
        return this._render
    }
    public run():Object {
        if (!this.rendered) this.render()
        return gulp.start([this.name.full])
    }
}

export { FullTask }