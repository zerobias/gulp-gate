/// <reference path="../typings/index.d.ts" />
// const R    = require('R')
const gulp = require('gulp')
const bump = require('gulp-bump')

const npmVer = vertype => function() {
    return gulp.src('./package.json')
        .pipe(bump({ type: vertype }))
        .pipe(gulp.dest('./'))
}
const BumpVersionTasks = function(typicalBumpTasks) {
    const SemverTask = function(verType) {
        const taskString = taskname => ['semver', taskname].join(':')
        const bumpTask = vertype => gulp.task(taskString(vertype), npmVer(vertype))
        return bumpTask(verType)
    }
    return typicalBumpTasks.map(SemverTask)
}
let bumpTasks = //currently not used
    BumpVersionTasks(['major', 'minor', 'patch'])
    // class BuildVersion {

// }
module.exports = bumpTasks