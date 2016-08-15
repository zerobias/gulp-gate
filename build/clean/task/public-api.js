"use strict";
const project_1 = require('./project');
const config = function (obj) {
    let list = project_1.Projectlist.configSplitter(obj);
    list.render();
    return {
        run: () => list.run(),
        get: (projectname) => list.get(projectname)
    };
};
module.exports = config;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = config;
