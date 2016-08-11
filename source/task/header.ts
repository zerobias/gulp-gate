
declare module Task {
    interface ITaskAdapter {
        taskname:string;
        subname:string;
        obj:Object;
        defpath:Function;
        task?:any;
    }
    interface ITask {
        taskname:string,
        subname:string,
        obj:string,
        defpath:string
    }
}
export { Task };