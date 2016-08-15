/// <reference path="../typings/index.d.ts" />
import * as path from 'path';
import * as gulp from 'gulp';
import * as plumber from 'gulp-plumber';
import * as cache from 'gulp-cached';
import * as remember from 'gulp-remember';
import * as sourcemaps from 'gulp-sourcemaps';
const stylus = require('gulp-stylus');
const cssnano = require('gulp-cssnano');
import * as concat from 'gulp-concat';
const nib = require('nib');
const sample = {
    source:{
        client:{
            stylus:{
                dir:{
                    source:'style',
                    dest:'css'
                },
                include: {
                    ext:'styl',
                    deep:true
                },
                taskOpts:{
                    sourceMaps:true
                },
                pipe:[
                    {
                        loader:'stylus',
                        opts:{
                            use:[nib()]
                        }
                    },
                    'cssnano',
                    {'concat':'app.css'}
                ]
            }
        }
    },
    result:{
        name:{
            short:'stylus',
            full:'client:stylus'
        },
        dir:{
            source:path.join(process.cwd(),'source','client','style','**','*.styl'),
            dest:path.join(process.cwd(),'build','dev','client','css'), // '.../css/app.css'
        },
        taskOpts:{
            protect:true,
            sourceMaps:true,
            notify:false,
            cache:true
        },
        pipe:[
            {
                loader:gulp.src,
                opts:path.join(process.cwd(),'source','client','style','**','*.styl')
            },
            {
                loader:plumber,
                opts:{}
            },
            {
                loader:cache,
                opts:'client:stylus'
            },
            {
                loader:sourcemaps.init,
                opts:{}
            },
            {
                loader:stylus,
                opts:{use:[]} // nib()
            },
            {
                loader:cssnano,
                opts:{}
            },
            {
                loader:concat,
                opts:'app.css'
            },
            {
                loader:sourcemaps.write,
                opts: path.join(process.cwd(),'source','client','maps')
            },
            {
                loader:remember,
                opts:'client:stylus'
            },
            {
                loader:gulp.dest,
                opts:path.join(process.cwd(),'build','dev','client','css')
            }
        ]
    }
}
export { sample };