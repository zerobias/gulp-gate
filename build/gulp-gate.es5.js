"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (f) {
    if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
        module.exports = f();
    } else if (typeof define === "function" && define.amd) {
        define([], f);
    } else {
        var g;if (typeof window !== "undefined") {
            g = window;
        } else if (typeof global !== "undefined") {
            g = global;
        } else if (typeof self !== "undefined") {
            g = self;
        } else {
            g = this;
        }g.gulpGate = f();
    }
})(function () {
    var define, module, exports;return function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
                }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
                    var n = t[o][1][e];return s(n ? n : e);
                }, l, l.exports, e, t, n, r);
            }return n[o].exports;
        }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
            s(r[o]);
        }return s;
    }({ 1: [function (require, module, exports) {
            "use strict";

            var Bucker = require('bucker');
            var settings = {
                console: {
                    colors: true
                }
            };

            var Logger = function () {
                function Logger(modulename) {
                    _classCallCheck(this, Logger);

                    this.modulename = modulename;
                    this.logger = Bucker.createLogger(Logger.options, modulename, function (err) {
                        if (err) console.error('failed loading bucker plugin');
                    });
                }

                _createClass(Logger, null, [{
                    key: "initPrint",
                    value: function initPrint(name) {
                        var log = new Logger(name);
                        log.logger.tags(['module init']).log("--module " + name + "--");
                        return log.logger;
                    }
                }]);

                return Logger;
            }();

            Logger.options = settings;
            exports.Logger = Logger;
        }, { "bucker": undefined }], 2: [function (require, module, exports) {
            (function (__dirname) {
                "use strict";

                var R = require('ramda');
                var resolve = require('resolve');
                var util = require('gulp-util');
                var logger_1 = require('../logger');
                var log = logger_1.Logger.initPrint('loader');

                var Loader = function () {
                    function Loader() {
                        _classCallCheck(this, Loader);
                    }

                    _createClass(Loader, null, [{
                        key: "require",
                        value: function require(_loader) {
                            return Loader.tryCatchRequire(_loader, R.when(R.is(String), Loader.resolveString));
                        }
                    }, {
                        key: "tryCatchRequire",
                        value: function tryCatchRequire(_loader, func) {
                            var req = null;
                            try {
                                req = func(_loader);
                            } catch (e) {
                                log.error("Loader.tryCatchRequire error! loader " + _loader + " " + e.name + " " + e.message);
                                req = util.noop;
                            }
                            return req;
                        }
                    }, {
                        key: "resolveString",
                        value: function resolveString(_loader) {
                            var prependWord = function prependWord(add) {
                                return function (str) {
                                    return R.pipe(R.of, R.prepend(add), R.join('-'))(str);
                                };
                            };
                            var isWithPrefix = R.ifElse(R.pipe(R.head, R.equals('^')), R.tail, prependWord('gulp'));
                            var resolved = Loader.syncLoad(isWithPrefix(_loader));
                            return R.ifElse(R.isNil, function () {
                                return util.noop;
                            }, require)(resolved);
                        }
                    }, {
                        key: "syncLoad",
                        value: function syncLoad(moduleName) {
                            var _module = null;
                            try {
                                _module = resolve.sync(moduleName, { basedir: __dirname });
                            } catch (e) {
                                log.error("Sync load module error! " + e.name + " " + e.message);
                            } finally {
                                return _module;
                            }
                        }
                    }]);

                    return Loader;
                }();

                exports.Loader = Loader;
            }).call(this, "/_projects\\Web\\gulp-gate\\build\\clean\\task");
        }, { "../logger": 1, "gulp-util": undefined, "ramda": undefined, "resolve": undefined }], 3: [function (require, module, exports) {
            "use strict";

            var R = require('ramda');
            var gulp = require('gulp');
            var gulpUtil = require('gulp-util');
            var util_1 = require('../util');
            var util_2 = require('../util');
            var validmodel_1 = require('./validmodel');
            var loader_1 = require('./loader');
            var logger_1 = require('../logger');
            var log = logger_1.Logger.initPrint('pipe');
            var inspector = require('schema-inspector');
            var debugPrintFabric = function debugPrintFabric(name) {
                return log.tags(['fabric type']).log("==Fabric " + name + "==");
            };

            var Pipe = function () {
                function Pipe() {
                    _classCallCheck(this, Pipe);
                }

                _createClass(Pipe, null, [{
                    key: "BatchFabric",
                    value: function BatchFabric(data) {
                        var obj = data.defpath(['pipe'])(data.obj);
                        var isArray = R.when(R.is(Array), Pipe.FabricArray);
                        log.tags(['pipeFactory', 'batch', 'pipes[0]']).log(obj[0]);
                        log.tags(['pipeFactory', 'batch', 'is array?']).log(isArray(obj));
                        return isArray(obj);
                    }
                }, {
                    key: "Pipe",
                    value: function Pipe(loader, opts) {
                        debugPrintFabric('Pipe');
                        return {
                            loader: loader,
                            opts: util_2.makeArrayIfIsnt(opts)
                        };
                    }
                }, {
                    key: "FabricArray",
                    value: function FabricArray(pipe) {
                        debugPrintFabric('Array');
                        return R.map(Pipe.FabricObject, pipe);
                    }
                }, {
                    key: "FabricObject",
                    value: function FabricObject(pipe) {
                        debugPrintFabric('Object');
                        var logKeys = function logKeys(_pipe) {
                            var keys = R.keys(_pipe);
                            log.tags(['pipe', 'keys', 'values']).log("---------keys length " + keys.length + " " + keys + " " + R.values(_pipe));
                        };
                        var isValidPipe = function isValidPipe(obj) {
                            return inspector.validate(validmodel_1.ValidatorModel.Pipe, obj).valid;
                        };
                        var validPipeMaker = function validPipeMaker(_pipe) {
                            return R.when(function (e) {
                                return R.is(String, e.loader);
                            }, R.pipe(util_1.reflectLogger(function (e) {
                                return log.debug('loader', loader_1.Loader.require(e.loader));
                            }), function (e) {
                                return Pipe.Pipe(loader_1.Loader.require(e.loader), e.opts);
                            }))(_pipe);
                        };
                        var isExactlyOneKey = R.pipe(R.keys, R.length, R.equals(1));
                        logKeys(pipe);
                        return R.cond([[isExactlyOneKey, Pipe.FabricKeypair], [isValidPipe, validPipeMaker], [R.is(String), Pipe.FabricString], [R.T, Pipe.FabricNoop]])(pipe);
                    }
                }, {
                    key: "FabricKeypair",
                    value: function FabricKeypair(pipe) {
                        debugPrintFabric('Keypair');
                        var pair = R.toPairs(pipe)[0];
                        var getLoader = loader_1.Loader.require(pair[0]);
                        return Pipe.Pipe(getLoader, pair[1]);
                    }
                }, {
                    key: "FabricNoop",
                    value: function FabricNoop() {
                        debugPrintFabric('Noop');
                        return Pipe.Pipe(gulpUtil.noop, []);
                    }
                }, {
                    key: "FabricString",
                    value: function FabricString(pipe) {
                        debugPrintFabric('String');
                        var resolved = loader_1.Loader.require(pipe);
                        log.debug(resolved);
                        return Pipe.Pipe(resolved, []);
                    }
                }]);

                return Pipe;
            }();

            Pipe.RenderPipeline_deprecated = function (pipeline) {
                return R.reduce(function (acc, e) {
                    return e(acc);
                }, gulp.src('./source/*.styl'), R.map(Pipe.RenderPipe, pipeline));
            };
            Pipe.RenderPipe = function (pipe) {
                return function (pipable) {
                    return R.when(R.is(Function), function (l) {
                        return pipable.pipe(R.apply(l, pipe.opts));
                    })(pipe.loader);
                };
            };
            Pipe.RenderFirstPipe = function (pipe) {
                return R.when(R.is(Function), function (l) {
                    return R.apply(l, pipe.opts);
                })(pipe.loader);
            };
            exports.Pipe = Pipe;

            var Pipeliner = function Pipeliner() {
                _classCallCheck(this, Pipeliner);
            };

            Pipeliner.append = function (pipe) {
                return function (line) {
                    return R.append(pipe, line);
                };
            };
            Pipeliner.prepend = function (pipe) {
                return function (line) {
                    return R.prepend(pipe, line);
                };
            };
            Pipeliner.enclose = function (prepend, append) {
                return function (line) {
                    return R.pipe(Pipeliner.prepend(prepend), Pipeliner.append(append))(line);
                };
            };
            Pipeliner.render = function (line) {
                var head = R.head(line);
                var tail = R.tail(line);
                return R.reduce(function (acc, e) {
                    return e(acc);
                }, Pipe.RenderFirstPipe(head), R.map(Pipe.RenderPipe, tail));
            };
            exports.Pipeliner = Pipeliner;
        }, { "../logger": 1, "../util": 7, "./loader": 2, "./validmodel": 6, "gulp": undefined, "gulp-util": undefined, "ramda": undefined, "schema-inspector": undefined }], 4: [function (require, module, exports) {
            "use strict";

            var R = require('ramda');
            var gulp = require('gulp');
            var task_1 = require('./task');
            var childNames = function childNames(obj) {
                return R.pluck('uid')(obj.list);
            };

            var ObjectSplitter = function ObjectSplitter() {
                _classCallCheck(this, ObjectSplitter);
            };

            ObjectSplitter.toPairs = R.toPairs;
            ObjectSplitter.tasklist = function (construct) {
                return R.pipe(ObjectSplitter.toPairs, R.map(construct));
            };
            ObjectSplitter.pairToProject = function (pair) {
                return R.apply(Project.configSplitter, pair);
            };
            ObjectSplitter.pairToTask = function (projectname) {
                return function (pair) {
                    return new task_1.FullTask(projectname, pair[0], pair[1]);
                };
            };
            ObjectSplitter.splitProjectlist = function (obj) {
                return new Projectlist(ObjectSplitter.tasklist(ObjectSplitter.pairToProject)(obj));
            };
            ObjectSplitter.splitProject = function (obj, projectname) {
                return new Project(ObjectSplitter.tasklist(ObjectSplitter.pairToTask(projectname))(obj), projectname);
            };

            var Renderable = function () {
                function Renderable(list, uid) {
                    _classCallCheck(this, Renderable);

                    this.list = list;
                    this.uid = uid;
                    this.rendered = false;
                }

                _createClass(Renderable, [{
                    key: "render",
                    value: function render() {
                        var self = this;
                        var thisRender = function thisRender() {
                            self.list.forEach(function (e) {
                                return e.render();
                            });
                            self.rendered = true;
                            gulp.task(self.uid, childNames(self));
                        };
                        if (!self.rendered) thisRender();
                    }
                }, {
                    key: "run",
                    value: function run() {
                        this.render();
                        return gulp.start([this.uid]);
                    }
                }]);

                return Renderable;
            }();

            var Projectlist = function (_Renderable) {
                _inherits(Projectlist, _Renderable);

                function Projectlist(list) {
                    _classCallCheck(this, Projectlist);

                    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Projectlist).call(this, list, 'build-all'));

                    _this.list = list;
                    return _this;
                }

                _createClass(Projectlist, [{
                    key: "get",
                    value: function get(projectname) {
                        return R.find(function (e) {
                            return e.uid === projectname;
                        })(this.list);
                    }
                }]);

                return Projectlist;
            }(Renderable);

            Projectlist.configSplitter = function (obj) {
                return ObjectSplitter.splitProjectlist(obj);
            };
            exports.Projectlist = Projectlist;

            var Project = function (_Renderable2) {
                _inherits(Project, _Renderable2);

                function Project(list, uid) {
                    _classCallCheck(this, Project);

                    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Project).call(this, list, uid));

                    _this2.list = list;
                    _this2.uid = uid;
                    return _this2;
                }

                _createClass(Project, [{
                    key: "get",
                    value: function get(taskname) {
                        return R.find(function (e) {
                            return e.name.short === taskname;
                        })(this.list).UserAdapter;
                    }
                }]);

                return Project;
            }(Renderable);

            Project.configSplitter = function (projectname, obj) {
                return ObjectSplitter.splitProject(obj, projectname);
            };
            exports.Project = Project;
        }, { "./task": 5, "gulp": undefined, "ramda": undefined }], 5: [function (require, module, exports) {
            "use strict";

            var gulp = require('gulp');
            var R = require('ramda');
            var path = require('path');
            var pipe_1 = require('./pipe');
            var pipe_2 = require('./pipe');
            var validmodel_1 = require('./validmodel');
            var logger_1 = require('../logger');
            var log = logger_1.Logger.initPrint('task');
            var inspector = require('schema-inspector');
            var plumber = require('gulp-plumber');
            var sourcemaps = require('gulp-sourcemaps');

            var TaskPreproc = function () {
                function TaskPreproc() {
                    _classCallCheck(this, TaskPreproc);
                }

                _createClass(TaskPreproc, null, [{
                    key: "Morph",
                    value: function Morph(data) {
                        var task = data.task;
                        task.name = TaskPreproc.NameFabric(data);
                        task.filemask = TaskPreproc.FilemaskFabric(data);
                        task.dir = TaskPreproc.DirFabric(data);
                        task.taskOpts = TaskPreproc.TaskOptsFabric(data);
                        task.list = TaskPreproc.PipesFabric(data);
                    }
                }, {
                    key: "NameFabric",
                    value: function NameFabric(data) {
                        var makeFullName = function makeFullName(subname, taskname) {
                            return [subname, taskname].join(':');
                        };
                        return {
                            short: data.taskname,
                            full: makeFullName(data.subname, data.taskname)
                        };
                    }
                }, {
                    key: "pathMaker",
                    value: function pathMaker(dirs) {
                        return R.pipe(R.prepend(process.cwd()), R.apply(path.join))(dirs);
                    }
                }, {
                    key: "FilemaskFabric",
                    value: function FilemaskFabric(data) {
                        var ext = data.defpath(['include', 'ext']);
                        var filename = function filename(_ext, name) {
                            return [name ? name : '*', _ext].join('.');
                        };
                        var deep = R.pathOr(false, ['include', 'deep']);
                        var result = R.pipe(ext, filename, R.of);
                        return R.ifElse(deep, R.pipe(result, R.prepend('**')), result)(data.obj);
                    }
                }, {
                    key: "DirFabric",
                    value: function DirFabric(data) {
                        var defPath = function defPath(target) {
                            return data.defpath(['dir', target])(data.obj);
                        };
                        var pathArray = function pathArray(target, targetFolder) {
                            return [targetFolder ? targetFolder : target, data.subname, defPath(target)];
                        };
                        return {
                            source: TaskPreproc.pathMaker(R.concat(pathArray('source'), data.task.filemask)),
                            dest: TaskPreproc.pathMaker(pathArray('dest', 'build'))
                        };
                    }
                }, {
                    key: "TaskOptsFabric",
                    value: function TaskOptsFabric(data) {
                        return inspector.sanitize(validmodel_1.ValidatorModel.TaskOpts, R.propOr({}, 'taskOpts', data.obj)).data;
                    }
                }]);

                return TaskPreproc;
            }();

            TaskPreproc.PipesFabric = function (data) {
                return pipe_1.Pipe.BatchFabric(data);
            };

            var PipelinePreproc = function () {
                function PipelinePreproc() {
                    _classCallCheck(this, PipelinePreproc);
                }

                _createClass(PipelinePreproc, null, [{
                    key: "Morph",
                    value: function Morph(task) {
                        task.list = PipelinePreproc.addMaps(task);
                        task.list = PipelinePreproc.addProtect(task);
                        task.list = PipelinePreproc.addSrcDest(task);
                    }
                }, {
                    key: "addSrcDest",
                    value: function addSrcDest(task) {
                        var isDestExists = function isDestExists(_task) {
                            return R.or(R.not(R.isNil(_task.dir.dest)), R.equals(false, _task.dir.dest));
                        };
                        var getSrc = function getSrc(_task) {
                            return pipe_1.Pipe.Pipe(gulp.src, [_task.dir.source]);
                        };
                        var getDest = function getDest(_task) {
                            return pipe_1.Pipe.Pipe(gulp.dest, [_task.dir.dest]);
                        };
                        var adder = function adder(task) {
                            var isDest = isDestExists(task);
                            var src = getSrc(task);
                            var dest = function dest() {
                                return getDest(task);
                            };
                            var add = isDest ? pipe_2.Pipeliner.enclose(src, dest()) : pipe_2.Pipeliner.append(src);
                            return R.pipe(PipelinePreproc.list, add)(task);
                        };
                        return adder(task);
                    }
                }, {
                    key: "addProtect",
                    value: function addProtect(task) {
                        return R.ifElse(R.path(['TaskOpts', 'protect']), R.pipe(PipelinePreproc.list, pipe_2.Pipeliner.prepend(pipe_1.Pipe.Pipe(plumber, []))), PipelinePreproc.list)(task);
                    }
                }, {
                    key: "addMaps",
                    value: function addMaps(task) {
                        return R.ifElse(R.path(['taskOpts', 'sourceMaps']), R.pipe(PipelinePreproc.list, pipe_2.Pipeliner.enclose(pipe_1.Pipe.Pipe(sourcemaps.init, []), pipe_1.Pipe.Pipe(sourcemaps.write, ['.']))), PipelinePreproc.list)(task);
                    }
                }, {
                    key: "list",
                    get: function get() {
                        return R.prop('list');
                    }
                }]);

                return PipelinePreproc;
            }();

            var FullTask = function () {
                function FullTask(subname, taskname, obj) {
                    _classCallCheck(this, FullTask);

                    this.subname = subname;
                    this.taskname = taskname;
                    this.obj = obj;
                    this.rendered = false;
                    TaskPreproc.Morph(this.PreprocessAdapter);
                    PipelinePreproc.Morph(this);
                }

                _createClass(FullTask, [{
                    key: "render",
                    value: function render() {
                        var self = this;
                        var thisRender = function thisRender() {
                            var pipes = pipe_2.Pipeliner.render(self.list);
                            gulp.task(self.name.full, function () {
                                return pipes;
                            });
                            self.rendered = true;
                            return pipes;
                        };
                        this.list.forEach(function (e) {
                            return log.info("----------------loader " + e.loader + " opts " + e.opts);
                        });
                        if (!this.rendered) thisRender();
                    }
                }, {
                    key: "run",
                    value: function run() {
                        this.render();
                        return gulp.start([this.name.full]);
                    }
                }, {
                    key: "PreprocessAdapter",
                    get: function get() {
                        return {
                            taskname: this.taskname,
                            subname: this.subname,
                            obj: this.obj,
                            defpath: R.pathOr(this.taskname),
                            task: this
                        };
                    }
                }, {
                    key: "UserAdapter",
                    get: function get() {
                        return {
                            task: this.name.short,
                            uid: this.name.full,
                            project: this.subname,
                            render: this.render,
                            run: this.run
                        };
                    }
                }, {
                    key: "uid",
                    get: function get() {
                        return this.name.full;
                    }
                }]);

                return FullTask;
            }();

            exports.FullTask = FullTask;
        }, { "../logger": 1, "./pipe": 3, "./validmodel": 6, "gulp": undefined, "gulp-plumber": undefined, "gulp-sourcemaps": undefined, "path": undefined, "ramda": undefined, "schema-inspector": undefined }], 6: [function (require, module, exports) {
            "use strict";

            var ValidatorModel = function () {
                function ValidatorModel() {
                    _classCallCheck(this, ValidatorModel);
                }

                _createClass(ValidatorModel, null, [{
                    key: "BoolDef",
                    value: function BoolDef(def) {
                        return {
                            type: 'boolean',
                            optional: false,
                            def: def
                        };
                    }
                }, {
                    key: "NoEmptyString",
                    get: function get() {
                        return {
                            type: 'string',
                            minLength: 1,
                            optional: false
                        };
                    }
                }, {
                    key: "TaskOpts",
                    get: function get() {
                        var bool = ValidatorModel.BoolDef;
                        return {
                            type: 'object',
                            properties: {
                                protect: bool(true),
                                sourceMaps: bool(true),
                                notify: bool(false),
                                cache: bool(true),
                                cleanBefore: bool(false)
                            }
                        };
                    }
                }, {
                    key: "Pipe",
                    get: function get() {
                        return {
                            type: 'object',
                            optional: false,
                            properties: {
                                loader: { type: ['function', 'string'], optional: false },
                                opts: { type: 'any', optional: true }
                            }
                        };
                    }
                }, {
                    key: "PipeArray",
                    get: function get() {
                        return {
                            type: 'array',
                            items: ValidatorModel.Pipe,
                            optional: false
                        };
                    }
                }, {
                    key: "ResultConfig",
                    get: function get() {
                        return {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'object',
                                    optional: false,
                                    properties: {
                                        short: ValidatorModel.NoEmptyString,
                                        full: ValidatorModel.NoEmptyString
                                    }
                                },
                                dir: {
                                    type: 'object',
                                    optional: false,
                                    properties: {
                                        source: ValidatorModel.NoEmptyString,
                                        dest: ValidatorModel.NoEmptyString
                                    }
                                },
                                taskOpts: ValidatorModel.TaskOpts,
                                pipe: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        optional: false,
                                        properties: {
                                            loader: { type: ['function', 'string'], optional: false },
                                            opts: { type: 'any', optional: true }
                                        }
                                    },
                                    optional: false
                                }
                            }
                        };
                    }
                }]);

                return ValidatorModel;
            }();

            exports.ValidatorModel = ValidatorModel;
        }, {}], 7: [function (require, module, exports) {
            "use strict";

            var R = require('ramda');
            var reflectLogger = function reflectLogger(logger) {
                return function (object) {
                    logger(object);
                    return object;
                };
            };
            exports.reflectLogger = reflectLogger;
            var makeArrayIfIsnt = R.when(R.pipe(R.is(Array), R.not), R.of);
            exports.makeArrayIfIsnt = makeArrayIfIsnt;
        }, { "ramda": undefined }], 8: [function (require, module, exports) {
            "use strict";

            var project_1 = require('./project');
            var config = function config(obj) {
                var list = project_1.Projectlist.configSplitter(obj);
                list.render();
                return {
                    run: function run() {
                        return list.run();
                    },
                    render: function render() {
                        return list.render();
                    },
                    get: function get(projectname) {
                        return list.get(projectname);
                    }
                };
            };
            module.exports = config;
            Object.defineProperty(exports, "__esModule", { value: true });
            exports.default = config;
        }, { "./project": 4 }] }, {}, [8])(8);
});