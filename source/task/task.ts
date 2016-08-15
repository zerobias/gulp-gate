/// <reference path="../../typings/index.d.ts" />
import * as gulp from 'gulp'
import * as R    from 'ramda'
import * as path from 'path'

import { Pipe as PipeFactory }  from './pipe'
import { IPipe }                from './pipe'
import { Pipeline }             from './pipe'
import { Pipeliner }            from './pipe'
import { ValidatorModel }       from './validmodel'
import { Task }                 from './header'

import { Logger }               from '../logger'
const log = Logger.initPrint('task')

const inspector = require('schema-inspector')
const plumber   = require('gulp-plumber')
const sourcemaps= require('gulp-sourcemaps')

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
    cache:boolean,
    cleanBefore:boolean
}

type Filemask = string[]

class TaskPreproc {
    public static Morph(data:Task.IMorphAdapter):void {
        let task = (<IJustTask>data).task

        task.name       = TaskPreproc.NameFabric(data)
        task.filemask   = TaskPreproc.FilemaskFabric(data)
        task.dir        = TaskPreproc.DirFabric(data)
        task.taskOpts   = TaskPreproc.TaskOptsFabric(data)
        task.list       = TaskPreproc.PipesFabric(data)
    }
    private static NameFabric(data:Task.IMorphAdapter):ITaskName {
        const makeFullName = (subname:string,taskname:string)=>[subname,taskname].join(':')
        return {
            short:data.taskname,
            full:makeFullName(data.subname,data.taskname)
        }
    }
    private static pathMaker(dirs:string[]):string {
        return R.pipe(R.prepend(process.cwd()),R.apply(path.join))(dirs)
    }
    private static FilemaskFabric(data:Task.IMorphAdapter):string[] {
        let ext = data.defpath(['include','ext'])
        let filename = (_ext:string,name?:string)=>[name?name:'*',_ext].join('.')
        let deep = R.pathOr(false,['include','deep'])
        let result = R.pipe(ext,filename,R.of)
        return R.ifElse(deep,R.pipe(result,R.prepend('**')),result)(data.obj)
    }
    private static DirFabric(data:Task.IMorphAdapter):ITaskDir {
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
    private static TaskOptsFabric(data:Task.IMorphAdapter):ITaskOpts {
        return inspector.sanitize(ValidatorModel.TaskOpts,R.propOr({},'taskOpts',data.obj)).data
    }
    private static PipesFabric = (data:Task.IMorphAdapter):IPipe[]=>PipeFactory.BatchFabric(data)
}
class PipelinePreproc {
    public static Morph(task:FullTask):void {
        task.list = PipelinePreproc.addMaps(task)
        task.list = PipelinePreproc.addProtect(task)
        task.list = PipelinePreproc.addSrcDest(task)
    }
    private static addSrcDest(task:FullTask):Pipeline {
        const isDestExists = (_task:FullTask)=>
            R.or(
                R.not(R.isNil(_task.dir.dest)),
                R.equals<string|boolean>(false,_task.dir.dest))
        const getSrc = (_task:FullTask):IPipe=>
            PipeFactory.Pipe(gulp.src,[_task.dir.source])
        const getDest = (_task:FullTask):IPipe=>
            PipeFactory.Pipe(gulp.dest,[_task.dir.dest])

        const adder = function(task:FullTask):IPipe[] {
            let isDest = isDestExists(task)
            let src = getSrc(task)
            let dest = ()=>getDest(task)
            const add = isDest
                ? Pipeliner.enclose(src,dest())
                : Pipeliner.append(src)
            return R.pipe(PipelinePreproc.list,add)(task)
        }
        return adder(task)
    }
    private static get list():(task:FullTask)=>Pipeline {
        return R.prop('list')
    }
    private static addProtect(task:FullTask):Pipeline {
        return R.ifElse(
            R.path(['TaskOpts','protect']),
            R.pipe(PipelinePreproc.list,Pipeliner.prepend(PipeFactory.Pipe(plumber,[]))),
            PipelinePreproc.list)(task)
    }
    private static addMaps(task:FullTask):Pipeline {
        return R.ifElse(
            R.path(['taskOpts','sourceMaps']),
            R.pipe(PipelinePreproc.list,Pipeliner.enclose(PipeFactory.Pipe(sourcemaps.init,[]),PipeFactory.Pipe(sourcemaps.write,['.']))),
            PipelinePreproc.list)(task)
    }
}

interface IJustTask {
    task?:FullTask
}

class FullTask {
    public name:ITaskName
    public dir :ITaskDir
    public filemask: string[]
    public taskOpts: ITaskOpts
    public list: IPipe[]
    private rendered:boolean = false
    constructor(public subname:string,public taskname:string,public obj:Object) {
        TaskPreproc.Morph(this.PreprocessAdapter)
        PipelinePreproc.Morph(this)
    }
    private get PreprocessAdapter():Task.IMorphAdapter {
        return {
            taskname:this.taskname,
            subname:this.subname,
            obj:this.obj,
            defpath:R.pathOr(this.taskname),
            task:this
        }
    }
    public get UserAdapter():Task.IUserAdapter {
        return {
            task:this.name.short,
            uid:this.name.full,
            project:this.subname,
            render:this.render,
            run:this.run
        }
    }
    public get uid():string {
        return this.name.full
    }
    public render():void {
        let self = this
        let thisRender = function() {
            let pipes = Pipeliner.render(self.list)
            gulp.task(self.name.full,function() {return pipes})
            self.rendered = true
            return pipes
        }
        this.list.forEach(e=>log.info(`----------------loader ${e.loader} opts ${e.opts}`))
        if (!this.rendered)
            thisRender()
    }

    public run():Object {
        this.render()
        return gulp.start([this.name.full])
    }
}

export { FullTask }