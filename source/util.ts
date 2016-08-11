/// <reference path="../typings/index.d.ts" />
import * as R from 'ramda'

const initPrint = (name)=>console.log(`--module ${name}--`)
const reflectLogger = logger=>object=> {
    logger(object)
    return object
}
const isntArray = R.when(R.pipe(R.is(Array),R.not),R.of)

export { initPrint }
export { reflectLogger }
export { isntArray }