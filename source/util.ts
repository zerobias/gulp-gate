/// <reference path="../typings/index.d.ts" />

const initPrint = (name)=>console.log(`--module ${name}--`);
const reflectLogger = logger=>object=>{
    logger(object);
    return object;
}
export { initPrint };

export { reflectLogger };