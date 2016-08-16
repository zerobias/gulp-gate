const gulp = require('gulp')
const nodemon = require('gulp-nodemon')
const typedoc = require("gulp-typedoc")

const config = require('./config')

gulp.task('tests', function() {
    return nodemon(config.nodemonjs('tests'));
})

gulp.task('watch', ['build'], function() {
    // return gulp
    //     .src(['./source/index.ts'])
    //     // .pipe(ts(tsproject))
    //     // .pipe(babel(config.babel))
    //     .pipe(nodemon(config.nodemon));
    gulp.watch('./source/**/*.*ts', ['build'])
    return nodemon(config.nodemonjs('index'))
})

gulp.task("typedoc", function() {
    return gulp
        .src(["source/*.ts"])
        .pipe(typedoc(config.typedoc));
})

gulp.task('default', ['watch'])

module.exports = {}