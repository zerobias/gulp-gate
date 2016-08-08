"use strict";
/// <reference path="../typings/index.d.ts" />
var path = require('path');
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var cache = require('gulp-cached');
var remember = require('gulp-remember');
var sourcemaps = require('gulp-sourcemaps');
var stylus = require('gulp-stylus');
var cssnano = require('gulp-cssnano');
var concat = require('gulp-concat');
// const nib = require('nib');
var sample = {
    source: {
        client: {
            stylus: {
                dir: {
                    source: 'style',
                    dest: 'css'
                },
                include: {
                    ext: 'styl',
                    deep: true
                },
                depends: {
                    stylus: stylus,
                    cssnano: cssnano,
                    concat: concat
                },
                taskOpts: {
                    sourceMaps: true
                },
                pipe: [
                    {
                        loader: 'stylus',
                        opts: {
                            use: [] // nib()
                        }
                    },
                    'cssnano',
                    { 'concat': 'app.css' }
                ]
            }
        }
    },
    result: {
        name: {
            short: 'stylus',
            full: 'client:stylus'
        },
        dir: {
            source: path.join(process.cwd(), 'source', 'client', 'style', '**', '*.styl'),
            dest: path.join(process.cwd(), 'build', 'dev', 'client', 'css'),
        },
        taskOpts: {
            protect: true,
            sourceMaps: true,
            notify: false,
            cache: true
        },
        pipe: [
            {
                loader: gulp.src,
                opts: path.join(process.cwd(), 'source', 'client', 'style', '**', '*.styl')
            },
            {
                loader: plumber,
                opts: {}
            },
            {
                loader: cache,
                opts: 'client:stylus'
            },
            {
                loader: sourcemaps.init,
                opts: {}
            },
            {
                loader: stylus,
                opts: { use: [] } // nib()
            },
            {
                loader: cssnano,
                opts: {}
            },
            {
                loader: concat,
                opts: 'app.css'
            },
            {
                loader: sourcemaps.write,
                opts: path.join(process.cwd(), 'source', 'client', 'maps')
            },
            {
                loader: remember,
                opts: 'client:stylus'
            },
            {
                loader: gulp.dest,
                opts: path.join(process.cwd(), 'build', 'dev', 'client', 'css')
            }
        ]
    }
};
exports.sample = sample;
