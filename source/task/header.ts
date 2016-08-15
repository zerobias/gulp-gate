
declare module Task {
    interface IUserAdapter {
        task        :string
        uid         :string
        project     :string
        render      :()=>void
        run         :()=>Object
    }
    interface IMorphAdapter {
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