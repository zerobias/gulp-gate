const test = require('tape')
const Task = require('../build/clean/task/task.js').FullTask

const simpleTask = obj => new Task('client', 'stylus', obj)
const minimalPipe = (result, assert) => assert.equal(result.list.length, 5, 'Five elements in pipe')
const minimalTest = arr => test('Result should have pipe', (assert) => {
    let result = simpleTask(arr)
    assert.ok(result, 'result is ok')
    minimalPipe(result, assert)
        // console.log(result)
    assert.end()
})
let testedVars = [
    'stylus', ['stylus'],
    { 'stylus': [] },
    [{ 'stylus': [] }],
    { pipe: 'stylus' },
    { pipe: ['stylus'] },
    { pipe: { 'stylus': [] } },
    { pipe: [{ 'stylus': [] }] }
]
testedVars.map(minimalTest)