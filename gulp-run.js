// const gulp = require('gulp')
const gate = require('./build/gulp-gate.es5-min.js')

const nib = require('nib');

let config = {
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
            taskOpts: {
                sourceMaps: true
            },
            pipe: [{
                    loader: 'stylus',
                    opts: {
                        use: [nib()]
                    }
                },
                { 'concat': 'app.css' },
                'cssnano'
            ]
        }
    }
}

console.log(gate)
let project = gate(config)
<<<<<<< HEAD
project.run()
=======
    // project.run()
    // project.render()
module.exports = project
>>>>>>> release/milestone-0
    // gulp.start(['bundle'])