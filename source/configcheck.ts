/// <reference path="../typings/index.d.ts" />
// import * as R from 'ramda';

import * as util from './util';
util.initPrint('config check');

import { func } from './propschecking';

import { sample as config } from './config-example';

const source = config.source;
const result = config.result;

// let printval = func(result)('name');

// console.log(source);


export default {};