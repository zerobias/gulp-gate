/// <reference path="../../typings/index.d.ts" />
import * as R       from 'ramda'
import * as gulp    from 'gulp'

import { Task }     from './header'
import { FullTask } from './task'

interface IProject {
    uid:string
    list:any[]
    render:()=>any
    run:()=>any
}

type TPair = [string,any]
const childNames = <T extends IProject>(obj:T)=><string[]>R.pluck('uid')(obj.list)
class ObjectSplitter {
    private static toPairs:(o:Object)=>TPair[] = R.toPairs
    private static tasklist = <T>(construct:(pair:TPair)=>T)=>R.pipe(ObjectSplitter.toPairs,R.map(construct))
    private static pairToProject:(pair:TPair)=>Project =
        (pair:TPair)=>R.apply(Project.configSplitter,pair)
    private static pairToTask =
        projectname=>
            (pair:TPair)=>new FullTask(projectname,pair[0],pair[1])
    public static splitProjectlist = (obj:Object)=>
        new Projectlist(ObjectSplitter.tasklist(ObjectSplitter.pairToProject)(obj));
    public static splitProject = (obj:Object,projectname:string)=>
        new Project(ObjectSplitter.tasklist(ObjectSplitter.pairToTask(projectname))(obj),projectname)

}
abstract class Renderable {
    protected rendered:boolean = false
    public render():void {
        let self = this
        const thisRender = function() {
            self.list.forEach(e => e.render())
            self.rendered = true
            gulp.task(self.uid,childNames(self))
        }
        if (!self.rendered)
            thisRender()
    }
    constructor(public list:any[],public uid:string) { }
    public run():Object {
        this.render()
        // this.list.forEach(e=>e.run())
        return gulp.start([this.uid])
    }
    abstract get(elementname:string):any
}
class Projectlist extends Renderable {
    public static configSplitter = (obj:Object):Projectlist=>
        ObjectSplitter.splitProjectlist(obj)
    constructor(public list:Project[]) { super(list,'build-all') }
    public get(projectname:string):Project {
        return R.find((e:Project)=>e.uid===projectname)(this.list)
    }
}
class Project extends Renderable {
    public static configSplitter = (projectname:string,obj:Object):Project =>
        ObjectSplitter.splitProject(obj,projectname)
    constructor(public list:FullTask[],public uid:string) { super(list,uid) }
    public get(taskname:string):Task.IUserAdapter {
        return (R.find((e:FullTask)=>e.name.short===taskname)(this.list)).UserAdapter
    }
}

export { Project }
export { Projectlist }