const webpack = require('webpack')
const path = require('path')
const typescript = require('ntypescript')

module.exports = {
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
    browserify: {
        rename: 'gulp-gate.js',
        src: [path.join(process.cwd(), 'build', 'clean', 'index.js')],
        out: path.join(process.cwd(), 'build')
    },
    babel: {
        // plugins: ['transform-runtime'],
        presets: ['es2015']
    },
    ts: {
        tsconf: path.join(process.cwd(), 'tsconfig.json'),
        config: {
            sortOutput: true,
            typescript: typescript
        }
    },
<<<<<<< HEAD
=======
    typedoc: {
        // TypeScript options (see typescript docs)
        module: "commonjs",
        target: "es2015",
        includeDeclarations: false,

        // Output options (see typedoc docs)
        out: "./doc",
        json: "index.json",

        // TypeDoc options (see typedoc docs)
        name: "gulp-gate",
        ignoreCompilerErrors: true,
        version: true,
    },
>>>>>>> release/milestone-0
    concat: 'index.js',
    build: path.join(process.cwd(), 'build', 'clean'),
    maps: path.join(process.cwd(), 'build', 'clean', 'maps')
}