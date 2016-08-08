/// <reference path="../typings/index.d.ts" />
import * as R from 'ramda';
import * as util from './util';

util.initPrint('props checking');

const printer = <T>(message:string):(obj:T)=>T =>(obj:T):T => {console.log(obj);return obj};

type FuncOf<T> = (obj:T)=>any;

const revertApply = <T>(prop:T)=>(func:FuncOf<T>)=>func(prop);
const simpleApply = func=>prop=>func(prop);
const mapFuncApply = <T>(list:T[])=>(func:FuncOf<T>)=>R.map(func)(list);
const funcMapApply = <T>(func:FuncOf<T>)=>(list:T[])=>R.map(func)(list);
const recFuncMap = <T>(...funcs:FuncOf<T>[])=>mapFuncApply(funcs)(funcMapApply);
const recursiveFuncMap = (...funcs)=>list=>R.apply(R.pipe,recFuncMap(printer('funcs')(funcs)))(printer('list')(list));

const enabledType = [Object,Array];

const isObjPropPass = <T>(types)=>
    (obj:T)=>(propname:string)=>
        R.anyPass(recursiveFuncMap(R.propIs,revertApply(propname))(types))(obj)
let isObjPropAoO = isObjPropPass(enabledType);

export { isObjPropAoO as func };