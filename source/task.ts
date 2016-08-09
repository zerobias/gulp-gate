/// <reference path="../typings/index.d.ts" />
import * as R from 'ramda';
import * as path from 'path';
import * as gulpUtil from 'gulp-util';

const inspector = require('schema-inspector');

import { F } from './f';

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
interface IPipe {
    loader:Function|String,
    opts:any[]
}
interface ITaskAdapter {
    taskname:string;
    subname:string;
    obj:Object;
    defpath:Function;
    task:FullTask;
}
type Filemask = string[];
class TaskPreproc {
    public static Morph(data:ITaskAdapter) {
        data.task.name = TaskPreproc.NameFabric(data);
        data.task.filemask = TaskPreproc.FilemaskFabric(data);
        data.task.dir = TaskPreproc.DirFabric(data);
        data.task.taskOpts = TaskPreproc.TaskOptsFabric(data);
        data.task.pipes = TaskPreproc.PipesFabric(data);
    };
    private static NameFabric(data:ITaskAdapter):ITaskName {
        const makeFullName = (subname:string,taskname:string)=>[subname,taskname].join(':');
        return {
            short:data.taskname,
            full:makeFullName(data.subname,data.taskname)
        };
    };
    private static pathMaker(dirs:string[]):string {
        return R.pipe(R.prepend(process.cwd()),R.apply(path.join))(dirs);
    }
    private static FilemaskFabric(data:ITaskAdapter):string[] {
        let ext = data.defpath(['include','ext']);
        let filename = (_ext:string,name?:string)=>[name?name:'*',_ext].join('.');
        let deep = R.pathOr(false,['include','deep']);
        let result = R.pipe(ext,filename,R.of)
        return R.ifElse(deep,R.pipe(result,R.prepend('**')),result)(data.obj)
    }
    private static DirFabric(data:ITaskAdapter):ITaskDir {
        let defPath = (target:string)=>data.defpath(['dir',target])(data.obj);
        let pathArray = (target:string,targetFolder?:string)=>[
            targetFolder
                ?targetFolder
                :target,
            data.subname,
            defPath(target)
        ];
        return {
            source:TaskPreproc.pathMaker(R.concat(pathArray('source'),data.task.filemask)),
            dest:TaskPreproc.pathMaker(pathArray('dest','build'))
        }
    }
    private static TaskOptsFabric(data:ITaskAdapter):ITaskOpts {
        const bool = (def:boolean)=> {return{
            type: 'boolean',
            optional: false,
            def:def}};
        const schema = {
            type: 'object',
            properties:{
                protect:    bool(true),
                sourceMaps: bool(true),
                notify:     bool(false),
                cache:      bool(true)
            }
        };
        return inspector.sanitize(schema,R.propOr({},'taskOpts',data.obj)).data;
    }
    private static PipesFabric = (data:ITaskAdapter):IPipe[]=>PipeFactory.BatchFabric(data);
}

class PipeFactory {
    static BatchFabric(data:ITaskAdapter):IPipe[] {
        let obj = data.defpath(['pipe'])(data.obj);
        return R.pipe(
            R.when(R.or(R.map(R.is,[String,Object])),R.of),
            R.ifElse(R.is(Array),R.map(PipeFactory.Fabric),_obj=>console.error(`Wrong type of ${_obj}`))
        )(obj);
    }
    private static Fabric(pipe):IPipe {
        console.log('Fabric');
        switch(typeof pipe) {
            case 'string':return PipeFactory.FabricString(pipe);
            case 'object':return PipeFactory.FabricObject(pipe);
            default:return PipeFactory.FabricNoop();
        }
    }
    private static FabricObject(pipe:Object):IPipe {
        const isValidPipe = (obj:Object):boolean =>
            inspector.validate({
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
            },obj).valid;
        if (isValidPipe(pipe)) return <IPipe>pipe;
        let keys = R.keys(pipe);
        return R.ifElse(
            R.pipe(R.keys,R.length,R.equals(1)),
            PipeFactory.FabricKeypair,
            PipeFactory.FabricNoop)(pipe);
    }
    private static FabricKeypair(pipe):IPipe {
        return R.pipe(R.toPairs,R.head,R.apply(PipeFactory.Pipe))(pipe);
    }
    private static FabricNoop():IPipe {
        console.log('FabricNoop');
        return PipeFactory.Pipe(gulpUtil.noop,[]);
    }
    private static FabricString(pipe:string):IPipe {
        console.log('FabricString');
        const requireString = (str:string)=>['gulp',str].join('-');
        return PipeFactory.Pipe(require(requireString(pipe)),[]);
    }
    private static Pipe(loader:Function|String,opts:any):IPipe {
        return {
            loader:loader,
            opts:opts
        }
    }
}

class FullTask {
    public name:ITaskName;
    public dir :ITaskDir;
    public filemask: string[];
    public taskOpts: ITaskOpts;
    public pipes: IPipe[];
    constructor(public subname:string,public taskname:string,public obj:Object) {
        TaskPreproc.Morph(this.Adapter);
    }
    private get Adapter():ITaskAdapter {
        return {
            taskname:this.taskname,
            subname:this.subname,
            obj:this.obj,
            defpath:R.pathOr(this.taskname),
            task:this
        }
    }
}

export { FullTask };