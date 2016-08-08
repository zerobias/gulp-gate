"use strict";
/// <reference path="../typings/index.d.ts" />
var test = require('tape');
var R = require('ramda');
var config_example_1 = require('./config-example');
var props_type_1 = require('./package/props-type');
var source = config_example_1.sample.source;
var result = config_example_1.sample.result;
var propsCheck = props_type_1.propsType([Object, Array]);
var propsNamed = propsCheck(['dir', 'taskOpts', 'name', 'pipe']);
console.log(propsNamed(result));
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
