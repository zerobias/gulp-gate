/// <reference path="../../typings/index.d.ts" />
import * as R       from 'ramda'
import * as resolve from 'resolve'
import * as util    from 'gulp-util';

import { Logger }   from '../logger'
const log = Logger.initPrint('loader')

type TLoader = Function|String|void|Object

class Loader {
    static require(_loader:TLoader):Function {
        return Loader.tryCatchRequire(_loader,
            R.when(
                R.is(String),
                    Loader.resolveString))
    }
    private static tryCatchRequire<T>(_loader:TLoader,func:(e:TLoader)=>T):Function {
        let req = null
        try {
            req = func(_loader)
        } catch(e) {
            log.error(`Loader.tryCatchRequire error! loader ${_loader} ${e.name} ${e.message}`)
            req = util.noop
        }
        return req
    }

    private static resolveString(_loader:string):Function {
        const prependWord = add=>str=>R.pipe(R.of,R.prepend(add),R.join('-'))(str)
        const isWithPrefix = R.ifElse(
            R.pipe(
                R.head,
                R.equals('^')),
            R.tail,
            prependWord('gulp'))
        let resolved = Loader.syncLoad(isWithPrefix(_loader))
        return R.ifElse(R.isNil,()=>util.noop,require)(resolved)
    }
    // /**
    //  * 
    //  * 
    //  * @private
    //  * @static
    //  * @param {string} moduleName
    //  * @returns {string}
    //  * @description currently not used method for async module string resolving
    //  */
    // private static asyncLoad(moduleName:string):string|void {
    //     const asyncCallback = function (err, res) {
    //         if (err) console.error(err)
    //         else log.tags(['async load info']).info(res)
    //         return res
    //     }
    //     return resolve(moduleName, { basedir: __dirname }, asyncCallback)
    // }

    private static syncLoad(moduleName:string):string {
        let _module = null
        try {
            _module = resolve.sync(moduleName, { basedir: __dirname })
        } catch(e) {
            log.error(`Sync load module error! ${e.name} ${e.message}`)
        } finally {
            return _module
        }
    }
}

export { TLoader }
export { Loader }