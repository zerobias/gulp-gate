"use strict";
const path = require('path');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const cache = require('gulp-cached');
const remember = require('gulp-remember');
const sourcemaps = require('gulp-sourcemaps');
const stylus = require('gulp-stylus');
const cssnano = require('gulp-cssnano');
const concat = require('gulp-concat');
const sample = {
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
                            use: []
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
                opts: { use: [] }
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
