/// <reference path="../../typings/index.d.ts" />
import * as R from 'ramda';
type ApplyFunc<U> = <T>(param:T)=>U;

class F {
    public static applyTo = <T,U>(e:ApplyFunc<U>):ApplyFunc<U>=>(passed:T):U=>e(passed);
    public static applyThis = <T,U>(passed:T):ApplyFunc<U>=>(e:ApplyFunc<U>):U=>e(passed);
    public static invertMap = <T,U>(list:ApplyFunc<U>[])=>R.map(F.applyTo,list);
    public static toInvertMap=<T,U>(list:ApplyFunc<U>[])=>(passed:T):U[]=>
        <U[]>R.map(F.applyThis(passed),list);
    public static invertMapApply = func=>R.pipe(R.map(func),F.invertMap);
    public static reflector = <T>(e:T)=>():T=>e;
    private static boolReducer = (func:(a:boolean,b:boolean)=>boolean,init:boolean)=>
        (arr:boolean[]):boolean=>R.reduce(func,init, arr);
    public static any = F.boolReducer(R.or,false);
    public static all = F.boolReducer(R.and,true);
    public static batchApply = <T,U>(func:ApplyFunc<U>)=>(arr:T[]):U[]=>R.map(func,arr);
}
export { ApplyFunc };
export { F };