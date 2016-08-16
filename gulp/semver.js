/// <reference path="../typings/index.d.ts" />
// const R    = require('R')
const gulp = require('gulp')
const bump = require('gulp-bump')
const path = require('path')

const npmVer = vertype => function() {
    return gulp.src(path.join(process.cwd(), 'package.json'))
        .pipe(bump({ type: vertype }))
        .pipe(gulp.dest(process.cwd()));
}

gulp.task('semver:patch', npmVer('patch'))

gulp.task('semver:minor', npmVer('minor'))
gulp.task('semver:major', npmVer('major'))

module.exports = {}