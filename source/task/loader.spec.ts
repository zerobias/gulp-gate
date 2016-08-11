/// <reference path="../../typings/index.d.ts" />
import * as test from 'tape';
import * as R from 'ramda'
import { Loader } from './loader'
import * as util from 'gulp-util';

test('Loader.require should return Function from "stylus"',(assert)=>{
    const source = 'stylus'
    let tested = Loader.require(source)
    assert.ok(R.is(Function,tested),'tested is function')
    assert.equal(tested,require('gulp-stylus'),'return gulp-stylus')
    assert.end()
})
test('Loader.require should return Function from "^gulp-stylus"',(assert)=>{
    const source = '^gulp-stylus'
    let tested = Loader.require(source)
    assert.ok(R.is(Function,tested),'tested is function')
    assert.equal(tested,require('gulp-stylus'),'return gulp-stylus')
    assert.notEqual(tested,util.noop,'not return gulp-util.noop')
    assert.end()
})
test('Loader.require should return Function from "^!gulp-stylus"',(assert)=>{
    const source = '^!gulp-stylus'
    let tested = Loader.require(source)
    assert.ok(R.is(Function,tested),'tested is function')
    assert.notEqual(tested,require('gulp-stylus'),'not return gulp-stylus')
    assert.equal(tested,util.noop,'return gulp-util.noop')
    assert.end()
})
test('Loader.require should return Function from "stylus!"',(assert)=>{
    const source = 'stylus!'
    let tested = Loader.require(source)
    assert.ok(R.is(Function,tested),'tested is function')
    assert.equal(tested,util.noop,'return gulp-util.noop')
    assert.end()
})
export default {}