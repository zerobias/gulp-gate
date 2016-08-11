"use strict";
const test = require('tape');
const R = require('ramda');
const config_example_1 = require('./config-example');
const props_type_1 = require('./package/props-type');
const source = config_example_1.sample.source;
const result = config_example_1.sample.result;
const propsCheck = props_type_1.propsType([Object, Array]);
const propsNamed = propsCheck(['dir', 'taskOpts', 'name', 'pipe']);
console.log(propsNamed(result));
test('Assertions with tape.', (assert) => {
    const expected = 'something to test';
    const actual = 'something to test';
    assert.equal(actual, expected, 'Given two mismatched values, .equal() should produce a nice bug report');
    assert.end();
});
test('Result should have these props', (assert) => {
    const props = ['name', 'dir', 'taskOpts', 'pipe'];
    assert.ok(R.is(Object, result), 'result is object');
    assert.end();
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {};
