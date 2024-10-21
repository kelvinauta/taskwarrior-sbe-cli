class Rules {
    constructor(options = {
        strict: true,
        prefix: '',
        concatPrefix: true
        
    }) {
        // validate options
        

        this.options = options;
        this._validateOptions(this.options);
    }
    _validateOptions(options = {}){
        if(!options) throw new Error('Options is required');
        if(typeof options !== 'object') throw new Error('Options must be an object');
        if(options.strict === undefined) throw new Error('Strict is required');
        if(typeof options.strict !== 'boolean') throw new Error('Strict must be a boolean');
        if(options.prefix === undefined) throw new Error('Prefix is required');
        if(typeof options.prefix !== 'string') throw new Error('Prefix must be a string');
        if(options.concatPrefix === undefined) throw new Error('Concat prefix is required');
        if(typeof options.concatPrefix !== 'boolean') throw new Error('Concat prefix must be a boolean');
    }
    _overrideOptions(overrideOptions = {}){
         let options = {...this.options, ...overrideOptions};
         if(!options.concatPrefix) return options;
         options.prefix = `${this.options.prefix}${overrideOptions.prefix}`;
         return options;
    }
    _build(overrideOptions = {}){
        return (...rules) => {
            // Example use:
            // validate(
            //     ['Text is required', !text],
            //     ['Text must be a string', typeof text !== 'string'],
            //     ['Options must be an object', typeof options !== 'object'],
            //     ['Minimal variations must be a boolean', typeof options.minimalVariations !== 'boolean']
            // )
        
            // validate rules
            const options = this._overrideOptions(overrideOptions);
            this._validateOptions(options);
            if(!rules) throw new Error('Rules is required');
            if(!Array.isArray(rules)) throw new Error(`Rules must be an array`);
            if(rules.some(item => !Array.isArray(item))) throw new Error(`Rules must be an array of arrays`);
            if(rules.some(item => typeof item[0] !== 'string')) throw new Error(`Rules[0] must be a string ${rules}`);
            if(rules.some(item => typeof item[1] !== 'boolean')) throw new Error(`Rules[1] must be a boolean`);
        
        
            // logic
            let result = {
                is: true,
                message: ""
            };
            rules.forEach(([message, condition]) => {
                if (!condition) return;
                const errorMessage = `${options.prefix} ${message}`;
                if (options.strict) throw new Error(errorMessage);
                result = {
                    is: false,
                    message: errorMessage
                };
            });
            return result;
           
        }
    }
    build(overrideOptions = {}){
        return this._build(overrideOptions);
    }
    add_prefix(prefix){
        return this._build({prefix});
    }

}

export default Rules;