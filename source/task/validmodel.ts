
type TypeString = 'boolean'|'string'|'object'|'number'|'function';

interface IInspectorTyped {
    type:TypeString
}
interface IBoolDef extends IInspectorTyped {
    optional:boolean,
    def:boolean
}
class ValidatorModel {
    static BoolDef(def:boolean):IBoolDef {
        return {
            type: 'boolean',
            optional: false,
            def:def
        }
    }
    static get TaskOpts() {
        const bool = ValidatorModel.BoolDef;
        return {
            type: 'object',
            properties:{
                protect:    bool(true),
                sourceMaps: bool(true),
                notify:     bool(false),
                cache:      bool(true)
            }
        }
    }
    static get Pipe() {
        return {
            type: 'object',
            optional: false,
            properties:{
                loader:{ type:['function','string'],optional:false },
                opts:{ type:'any', optional:true }
            }
        }
    }
    static get PipeArray() {
        return {
            type: 'array',
            items: ValidatorModel.Pipe,
            optional: false
        }
    }
}

export { ValidatorModel };