const gulp = require('gulp')
    // const util = require('gulp-util')
    // const path = require('path')
const babel = require('gulp-babel')
const ts = require('gulp-typescript')
    // const typescript = require('ntypescript')
    // const concat = require('gulp-concat')
const plumber = require('gulp-plumber')
    // const sourcemaps = require('gulp-sourcemaps')
const cache = require('gulp-cached')
const remember = require('gulp-remember')
const rename = require('gulp-rename')
const browserify = require('browserify')
const vinyl = require('vinyl-source-stream')
const minify = require('gulp-minify')
const shell = require('gulp-shell')
const sequence = require('run-sequence')

// const webpackGulp = require('gulp-webpack')
// const webpack = require('webpack')
const config = require('./config')

gulp.task('build', function() {
    let tsproject = ts.createProject(config.ts.tsconf, config.ts.config);
    return gulp
        .src(['./source/index.ts', './source/**/*.ts'])
        // .pipe(plumber())
        .pipe(cache('ts'))
        .pipe(ts(tsproject)).js
        // .pipe(sourcemaps.init())
        // .pipe(webpackGulp(config.webpack))
        // 
        // .pipe(sourcemaps.write('.'))
        .pipe(remember('ts'))
        // .pipe(concat(config.concat))
        .pipe(gulp.dest(config.build))
})

gulp.task('build:bundles', function() {
    return gulp
        .src('./build/gulp-gate.js')
        .pipe(plumber())
        // .pipe(minify())
        // .pipe(rename(function(path) {
        //     path.basename += ".min";
        // }))
        // .pipe(gulp.dest('./build'))
        .pipe(babel(config.babel))
        .pipe(rename(function(path) {
            path.basename += ".es5";
        }))
        .pipe(gulp.dest('./build'))
        .pipe(minify())
        .pipe(gulp.dest('./build'))

})
gulp.task('build:concat', function() {
    return shell.task("browserify --no-bundle-external --standalone 'gulp-gate' --node build/clean/task/public-api.js -o build/gulp-gate.js") })

gulp.task('build:all', function() {
    return sequence('build', 'build:concat', 'build:bundles', 'semver:patch') })


gulp.task('bundle', function() {
    // var production = util.env.type === 'production'
    return browserify(config.browserify.src, {
            extensions: ['.js'],
            standalone: 'gulp-gate',
            bundleExternal: false,
            node: true
        })
        .bundle()
        .pipe(vinyl(config.browserify.rename))
        .pipe(gulp.dest(config.browserify.out))
})

module.exports = {}