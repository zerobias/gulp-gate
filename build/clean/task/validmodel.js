"use strict";
class ValidatorModel {
    static BoolDef(def) {
        return {
            type: 'boolean',
            optional: false,
            def: def
        };
    }
    static get NoEmptyString() {
        return {
            type: 'string',
            minLength: 1,
            optional: false
        };
    }
    static get TaskOpts() {
        const bool = ValidatorModel.BoolDef;
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
    static get Pipe() {
        return {
            type: 'object',
            optional: false,
            properties: {
                loader: { type: ['function', 'string'], optional: false },
                opts: { type: 'any', optional: true }
            }
        };
    }
    static get PipeArray() {
        return {
            type: 'array',
            items: ValidatorModel.Pipe,
            optional: false
        };
    }
    static get ResultConfig() {
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
}
exports.ValidatorModel = ValidatorModel;
