"use strict";
/// <reference path="../../typings/index.d.ts" />
var test = require('tape');
var tested = require('./props-type');
test('propsType', function (assert) {
    var props = ['name', 'dir', 'pipe'];
    var src = {
        t1: {
            name: 'aaa',
            dir: 'none',
            pipe: ''
        },
        t2: {},
        t3: {
            name: 1233,
            dir: {},
            pipe: 0
        }
    };
    var isString = tested.propsType([String]);
    var isObjOrNumber = tested.propsType([Object, Number]);
    var propsTest = isString(props);
    var objTest = isObjOrNumber(props);
    assert.ok(propsTest(src.t1), 't1 has all string props');
    assert.notOk(propsTest(src.t2), 't2 hasnt any string props');
    assert.notOk(propsTest(src.t3), 't3 hasnt proper types of props');
    assert.ok(objTest(src.t3), 't3 is valid Array or Number having object');
    assert.end();
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {};
