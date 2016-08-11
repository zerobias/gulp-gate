/// <reference path="../../typings/index.d.ts" />
import * as R           from 'ramda'
// import * as path from 'path'
import * as gulpUtil    from 'gulp-util'


import { reflectLogger }    from '../util'
import { Task }             from './header'
import { ValidatorModel }   from './validmodel'
import { TLoader }          from './loader'
import { Loader }           from './loader'

import { Logger }           from '../logger'
const log = Logger.initPrint('pipe')

const inspector = require('schema-inspector')

interface IPipe {
    loader:TLoader,
    opts:any[]
}

const debugPrintFabric = (name:string)=>log.tags(['fabric type']).log(`==Fabric ${name}==`);



class Pipe {
    private static isntArray = R.when(R.pipe(R.is(Array),R.not),R.of)
    static BatchFabric(data:Task.ITaskAdapter):IPipe[] {
        let obj = data.defpath(['pipe'])(data.obj)
        const isArray = R.when(R.is(Array),Pipe.FabricArray)
        const isInsideArray = R.pipe(R.head,R.is(Array))
        log.tags(['pipeFactory','batch','pipes[0]']).log(obj[0])
        log.tags(['pipeFactory','batch','is array?']).log(isArray(obj))
        return isArray(obj);
        // return R.pipe(
        //     isntArray,
        //     R.ifElse(isInsideArray,R.map(R.pipe(R.head,PipeFactory.Fabric)),_obj=>console.error(`Wrong type of ${_obj}`))
        // )(obj)
    }
    private static Fabric(pipe):IPipe {
        debugPrintFabric('simple')
        switch(typeof pipe) {
            case 'string':return Pipe.FabricString(pipe)
            case 'object':return Pipe.FabricObject(pipe)
            default:return Pipe.FabricNoop()
        }
    }
    private static FabricArray(pipe:Object[]):IPipe[]{
        debugPrintFabric('Array')
        return R.map(Pipe.FabricObject,pipe)
    }
    private static FabricObject(pipe:Object):IPipe {
        debugPrintFabric('Object')
        const isValidPipe = (obj:Object):boolean =>
            inspector.validate(ValidatorModel.Pipe,obj).valid
        const validPipeMaker = (_pipe:IPipe)=>
            R.when(
                (e:IPipe)=>R.is(String,e.loader),
                R.pipe(
                    reflectLogger((e:IPipe)=>log.debug('loader',Loader.require(e.loader))),
                    (e:IPipe)=>Pipe.Pipe(
                        Loader.require(e.loader),
                        e.opts)
                ))(_pipe)
        let keys = R.keys(pipe)
        log.tags(['pipe','keys','values']).log(`---------keys length ${keys.length} ${keys} ${R.values(pipe)}`)
        return R.cond([
            [R.pipe(R.keys,R.length,R.equals(1)),Pipe.FabricKeypair],
            [isValidPipe,validPipeMaker],
            [R.is(String),Pipe.FabricString],
            [R.T,Pipe.FabricNoop]
        ])(pipe)
    }
    private static FabricKeypair(pipe):IPipe {
        debugPrintFabric('Keypair')
        let pair = R.toPairs(pipe)[0]
        let getLoader = Loader.require(pair[0])
        return Pipe.Pipe(getLoader,pair[1])
    }
    private static FabricNoop():IPipe {
        debugPrintFabric('Noop')
        return Pipe.Pipe(gulpUtil.noop,[])
    }
    private static FabricString(pipe:string):IPipe {
        debugPrintFabric('String')
        log.debug(Loader.require(pipe))
        return Pipe.Pipe(Loader.require(pipe),[])
    }
    private static Pipe(loader:TLoader,opts:any):IPipe {
        debugPrintFabric('Pipe')
        return {
            loader:loader,
            opts:Pipe.isntArray(opts)
        }
    }
}

export { Pipe }
export { IPipe }