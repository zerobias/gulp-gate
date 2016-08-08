"use strict";
/// <reference path="../typings/index.d.ts" />
var config_example_1 = require('./config-example');
var test = require('tape');
var R = require('ramda');
var source = config_example_1.sample.source;
var result = config_example_1.sample.result;
var F = (function () {
    function F() {
    }
    F.applyTo = function (e) { return function (passed) { return e(passed); }; };
    F.applyThis = function (passed) { return function (e) { return e(passed); }; };
    F.invertMap = function (list) { return R.map(F.applyTo, list); };
    F.invertMapApply = function (func) { return R.pipe(R.map(func), F.invertMap); };
    return F;
}());
var batchApply = function (func) { return function (arr) { return R.map(func, arr); }; };
var batchApplificator = function () {
    var funcs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        funcs[_i - 0] = arguments[_i];
    }
    return R.map(batchApply, funcs);
};
var batchConds = batchApply(R.propIs);
var batchAoO = batchConds([Object, Array]);
var applyToAoO = function (prop) { return function (arr) { return R.map(F.applyThis(prop), arr); }; };
var propsAoO = function (prop) { return applyToAoO(prop)(batchAoO); };
var final1 = function (prop) { return function (obj) { return R.anyPass(R.map(function (e) { return function () { return e; }; }, R.map(F.applyThis(obj), propsAoO(prop))))(obj); }; };
// let final2 = R.anyPass(F.applyTo(applyToAoO('dir')(batchAoO)));
console.log(final1('dir')(result));
// const propIsConds = F.invertMap(R.map(R.propIs));
// const propIsAorO = F.invertMapApply([Object,Array]);
// const propConds = (conds)=>(prop)=>R.pipe(propIsConds(conds),F.invertMap,R.anyPass)(prop);
var util = {
    propIsObject: R.propIs(Object)
};
test('A passing test', function (assert) {
    assert.pass('This test will pass.');
    assert.end();
});
test('Assertions with tape.', function (assert) {
    var expected = 'something to test';
    var actual = 'something to test';
    assert.equal(actual, expected, 'Given two mismatched values, .equal() should produce a nice bug report');
    assert.end();
});
test('Result should have these props', function (assert) {
    var props = ['name', 'dir', 'taskOpts', 'pipe'];
    // const passing = util.propsAreObjects(props);
    // assert.ok(passing,'passing is real');
    // assert.ok(R.is(Function,passing),'passing is function');
    assert.ok(R.is(Object, result), 'result is object');
    // assert.ok(passing(result),'result have all props');
    // console.log(passing);
    assert.end();
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {};
