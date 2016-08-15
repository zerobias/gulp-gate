// import babel from 'rollup-plugin-babel'
// import babelrc from 'babelrc-rollup'
// import istanbul from 'rollup-plugin-istanbul'
import typescript from 'rollup-plugin-typescript'

// let pkg = require('./package.json')
// let external = Object.keys(pkg.dependencies)
// import { rollup } from 'rollup';
import nodeResolve from 'rollup-plugin-node-resolve';

import commonjs from 'rollup-plugin-commonjs';
import * as ts from 'ntypescript'
export default {
    entry: 'source/index.ts',
    plugins: [
        typescript({
            typescript: ts,
            target: 'es5',
            module: 'es6'
        }),
        nodeResolve({ jsnext: true, main: true }),
        commonjs()
    ],
    dest: 'build/bundle.js',
    moduleName: 'gulp-gate',
    format: 'iife'
};

// export default {
//     entry: 'source/index.ts',
//     dest: 'build/app.js',
//     format: 'iife',
//     plugins: [
//         typescript({
//             typescript: require('ntypescript')
//         })
//         // babel(babelrc()),
//         // istanbul({
//         //     exclude: ['test/**/*', 'build/clean/**/*.spec.js', 'node_modules/**/*']
//         // })
//     ],
//     external: external,
//     targets: [{
//         dest: pkg['main'],
//         format: 'umd',
//         moduleName: 'gulp-gate',
//         sourceMap: true
//     }, {
//         dest: pkg['jsnext:main'],
//         format: 'es',
//         sourceMap: true
//     }]
// }