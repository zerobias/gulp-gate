/// <reference path="../../typings/index.d.ts" />
import * as R from 'ramda'
import { Projectlist } from './project'

const config = function(obj:Object):R.Dictionary<Function> {
    let list = Projectlist.configSplitter(obj)
    list.render()
    return {
        run:()=>list.run(),
        render:()=>list.render(),
        get:(projectname:string)=>list.get(projectname)
    }
}

module.exports = config
// export { config }
export default config