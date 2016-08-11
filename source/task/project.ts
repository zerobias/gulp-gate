/// <reference path="../../typings/index.d.ts" />
import * as R       from 'ramda'
import * as gulp    from 'gulp'

import { FullTask } from './task'

interface IProject {
    uid:string
    render:()=>any
    run:()=>any
}

class Projectlist {
    public static configSplitter(obj:Object):Projectlist {
        const pairToTask = (pair:[string,any])=>R.apply(Project.configSplitter,pair)
        const toPairs = <[string,any]>R.toPairs(obj)
        let tasklist = R.map(pairToTask)(toPairs)
        return new Projectlist(tasklist)
    }
    constructor(public list:Project[]) { }
    private rendered:boolean = false
    private get _render():Function {
        const thisRender = ()=> {
            this.list.forEach(e => e.render())
            this.rendered = true
        }
        const onceRender = R.once(thisRender)
        return onceRender
    }
    public render():void {
        return this._render()
    }
    public run():void {
        if (!this.rendered) this.render()
        this.list.forEach(e=>e.run())
    }
    public get(projectname:string):Project {
        return R.find((e:Project)=>e.uid===projectname)(this.list)
    }
}
class Project {
    public static configSplitter(projectname:string,obj:Object):Project {
        const pairToTask = (pair:[string,any])=>new FullTask(projectname,pair[0],pair[1])
        const toPairs = <[string,any]>R.toPairs(obj)
        let tasklist = R.map(pairToTask)(toPairs)
        return new Project(tasklist,projectname)
    }
    constructor(public list:FullTask[],public uid:string) { }
    private rendered:boolean = false
    private static childNames = (obj:Project)=>
        R.map((e:IProject)=>e.uid)(obj.list);
    private get _render():Function {
        const thisRender = ()=> {
            this.list.forEach(e => e.render())
            this.rendered = true
            gulp.task(this.uid,Project.childNames(this))
        }
        const onceRender = R.once(thisRender)
        return onceRender
    }
    public render():void {
        return this._render()
    }
    public run():Object {
        if (!this.rendered) this.render()
        return gulp.start([this.uid])
    }
    public get(taskname:string):FullTask {
        return R.find((e:FullTask)=>e.name.short===taskname)(this.list)
    }
}

export { Project }
export { Projectlist }