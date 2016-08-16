/// <reference path="../typings/index.d.ts" />
import * as R from 'ramda'

const reflectLogger = logger=>object=> {
    logger(object)
    return object
}
const makeArrayIfIsnt = R.when(R.pipe(R.is(Array),R.not),R.of)

export { reflectLogger }
export { makeArrayIfIsnt }