/// <reference path="typings/index.d.ts" />
const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const path = require('path');
const babel = require('gulp-babel');
const ts = require('gulp-typescript');
const typescript = require('ntypescript');
const concat = require('gulp-concat');
const cache = require('gulp-cached');
const remember = require('gulp-remember');
// const webpackGulp = require('gulp-webpack');
const webpack = require('webpack');
const config = {
    nodemon: {
        script: 'source/index.ts',
        ext: 'js ts',
        env: { 'NODE_ENV': 'development' },
        ignore: [
            'build/',
            'doc/',
            'node_modules/',
            'test/'
        ],
        'exclude': [
            'typings/main.d.ts',
            'typings/main',
            'node_modules'
        ]
    },
    nodemonjs: (scriptName) => {
        return {
            script: 'build/clean/' + scriptName + '.js',
            ext: 'js ts',
            // tasks: ['build'],
            ignore: [
                // 'build/clean/',
                'doc/',
                'node_modules/',
                'test/',
                'typings/',
                'source/',
                'gulpfile.js'
            ],
            exclude: [
                'node_modules',
                'typings'
            ]
        }
    },
    webpack: {
        watch: true,
        devtool: 'source-map',
        useBabel: true,
        // useCache: true,
        entry: {
            "app": ["./source/index.ts"],
            "vendor": ["ramda", "bucker", "gulp", "path", "gulp-plumber", "gulp-stylus"],
            "runtime": ["querystring", "debug", "url"]
        },
        resolve: {
            extensions: ['', '.ts', '.js']
        },
        module: {
            noParse: ['gulp', 'gulp-cssnano', 'path', 'beeper', 'ramda', 'gulp-stylus', 'bucker'],
            loaders: [{
                test: /\.styl$/,
                loader: 'style-loader!css-loader!postcss-loader!stylus-loader'
            }, {
                test: /\.json$/,
                loader: 'json-loader'
            }, {
                test: /\.md$/,
                loader: 'markdown-loader'
            }, {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader', //'ts-loader?compiler=ntypescript'
                exclude: /node_modules/
            }, {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    plugins: ['transform-runtime'],
                    presets: ['es2015']
                },
                exclude: /node_modules/
            }],
        },
        output: { filename: '[name].bundle.js' },
        node: {
            fs: "empty"
        },
        plugins: [
            new webpack.NoErrorsPlugin(),
            new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js"),
            new webpack.ProgressPlugin((percentage, message) => console.log(`${message} ${(percentage*100).toFixed()}%`)),
        ]
    },
    babel: {
        plugins: ['transform-runtime'],
        presets: ['es2015']
    },
    ts: {
        tsconf: path.join(process.cwd(), 'tsconfig.json'),
        config: {
            sortOutput: true,
            typescript: typescript
        }
    },
    concat: 'index.js',
    build: path.join(process.cwd(), 'build', 'clean')
};

gulp.task('build', function() {
    let tsproject = ts.createProject(config.ts.tsconf, config.ts.config);
    return gulp
        .src(['./source/index.ts', './source/**/*.ts'])
        .pipe(cache('ts'))
        .pipe(ts(tsproject)).js

    // .pipe(webpackGulp(config.webpack))
    // .pipe(babel(config.babel))

        .pipe(remember('ts'))
        // .pipe(concat(config.concat))
        .pipe(gulp.dest(config.build))
})
gulp.task('watch', ['build'], function() {
    // return gulp
    //     .src(['./source/index.ts'])
    //     // .pipe(ts(tsproject))
    //     // .pipe(babel(config.babel))
    //     .pipe(nodemon(config.nodemon));
    gulp.watch('./source/**/*.*ts', ['build']);
    return nodemon(config.nodemonjs('index'));
});
var typedoc = require("gulp-typedoc");

gulp.task("typedoc", function() {
    return gulp
        .src(["source/*.ts"])
        .pipe(typedoc({
            // TypeScript options (see typescript docs)
            module: "commonjs",
            target: "es6",
            includeDeclarations: true,

            // Output options (see typedoc docs)
            out: "./doc",
            json: "index.json",

            // TypeDoc options (see typedoc docs)
            name: "gulp-gate",
            ignoreCompilerErrors: true,
            version: true,
        }));
});
gulp.task('tests', function() {
    return nodemon(config.nodemonjs('tests'));
})
gulp.task('default', ['watch']);