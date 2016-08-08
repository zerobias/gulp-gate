/// <reference path="../typings/index.d.ts" />
import { sample as config } from './config-example';
import * as test from 'tape';
import * as R from 'ramda';

const source = config.source;
const result = config.result;

type ApplyFunc<U> = <T>(param:T)=>U;

class F {
    public static applyTo = <T,U>(e:ApplyFunc<U>):ApplyFunc<U>=>(passed:T):U=>e(passed);
    public static applyThis = <T,U>(passed:T):ApplyFunc<U>=>(e:ApplyFunc<U>):U=>e(passed);
    public static invertMap = <T,U>(list:ApplyFunc<U>[])=>R.map(F.applyTo,list);
    public static invertMapApply = func=>R.pipe(R.map(func),F.invertMap);
}

const batchApply = <T,U>(func:ApplyFunc<U>)=>(arr:T[]):U[]=>R.map(func,arr);
const batchApplificator = (...funcs:ApplyFunc<any>[]):((arr:{}[])=>{}[])[]=>R.map(batchApply,funcs);

let batchConds = batchApply(R.propIs);
let batchAoO = batchConds([Object,Array]);
let applyToAoO = (prop:string)=>(arr:any[])=>R.map(F.applyThis(prop),arr);
let propsAoO = (prop:string)=><any[]>applyToAoO(prop)(batchAoO);
let final1 = (prop:string)=>(obj)=>R.anyPass(<any[]>R.map(e=>()=>e,<any[]>R.map(F.applyThis(obj),propsAoO(prop))))(obj);
// let final2 = R.anyPass(F.applyTo(applyToAoO('dir')(batchAoO)));
console.log(final1('dir')(result));
// const propIsConds = F.invertMap(R.map(R.propIs));
// const propIsAorO = F.invertMapApply([Object,Array]);
// const propConds = (conds)=>(prop)=>R.pipe(propIsConds(conds),F.invertMap,R.anyPass)(prop);
const util = {
    propIsObject:R.propIs(Object)
    // propsAreObjects:(props)=>R.pipe(R.map(R.propIs(Object),props),R.allPass)
}

test('A passing test', (assert) => {

  assert.pass('This test will pass.');

  assert.end();
});

test('Assertions with tape.', (assert) => {
  const expected = 'something to test';
  const actual = 'something to test';

  assert.equal(actual, expected,
    'Given two mismatched values, .equal() should produce a nice bug report');

  assert.end();
});

test('Result should have these props',(assert)=>{
    const props = ['name','dir','taskOpts','pipe'];
    // const passing = util.propsAreObjects(props);
    // assert.ok(passing,'passing is real');
    // assert.ok(R.is(Function,passing),'passing is function');
    assert.ok(R.is(Object,result),'result is object');
    // assert.ok(passing(result),'result have all props');
    // console.log(passing);
    assert.end();
})


export default {};