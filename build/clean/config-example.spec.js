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
    F.invertMap = function (list) { return function (passed) { return R.map(F.applyTo(list)); }; };
    F.invertMapApply = function (func) { return R.pipe(R.map(func), F.invertMap); };
    return F;
}());
var propIsConds = F.invertMap(R.map(R.propIs));
var propIsAorO = F.invertMapApply([Object, Array]);
var propConds = function (conds) { return function (prop) { return R.pipe(propIsConds(conds), F.invertMap, R.anyPass)(prop); }; };
var util = {
    propIsObject: R.propIs(Object),
    propsAreObjects: function (props) { return R.pipe(R.map(R.propIs(Object), props), R.allPass); }
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
    var passing = util.propsAreObjects(props);
    assert.ok(passing, 'passing is real');
    assert.ok(R.is(Function, passing), 'passing is function');
    assert.ok(R.is(Object, result), 'result is object');
    assert.ok(passing(result), 'result have all props');
    // console.log(passing);
    assert.end();
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {};
