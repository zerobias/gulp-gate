import * as gulp from 'gulp';
import * as nodemon from 'gulp-nodemon';

const config = {nodemon:{
        script: 'source/index.ts',
        ext: 'js ts',
        env: { 'NODE_ENV': 'development' },
        ignore: [
            'build/',
            'doc/',
            'node_modules/',
            'test/'
        ]
    }};

gulp.task('watch', function() {
    nodemon(config.nodemon);
});

gulp.task('default',['watch']);