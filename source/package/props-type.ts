/// <reference path="../../typings/index.d.ts" />
import * as R from 'ramda'
// import { sample as config } from '../config-example'
import { F } from './f'
import * as util from './../util'

util.initPrint('props type')

let propType =
(types:any[])=>
    (prop:string)=>
        (obj)=>
            F.any(
                <any[]>F.toInvertMap(
                    <any[]>F.toInvertMap(F.batchApply(R.propIs)(types))(prop)
                )(obj)
            )
const propsType = (types:any[])=>(props:string[])=>(obj:{})=>
    F.all(F.toInvertMap(R.map(propType(types),props))(obj))

export { propsType }
export { propType }

