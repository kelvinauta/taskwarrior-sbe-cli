// Export all files in a directory
import { Glob } from "bun";


class ExportDirectory {
    constructor(directory, exclude = 'index.js', extensions = '.js'){
        this.directory = directory;
        this.exclude = exclude;
        this.extensions = extensions;
        this.paths = [];
        this.exports = {};


    }
    _validateInput(){
        if (!this.directory) throw new Error("Folder path is required");
        if (typeof this.directory !== "string") throw new Error("Folder path must be a string");
        if (typeof this.exclude !== "string") throw new Error("Exclude must be a string");
        if (typeof this.extensions !== "string") throw new Error("Extensions must be a string");
        if (this.exclude.length === 0) throw new Error("Exclude string cannot be empty");
        if (this.extensions.length === 0) throw new Error("Extensions string cannot be empty");
        if (!this.extensions.startsWith('.')) throw new Error("Extensions string must start with a dot");
        console.info("Input validated");
    }
    async _scanDirectory(){
        let paths = [];
        const glob = new Glob(`**/*{${this.extensions}}`);
        for await (const file of glob.scan({
            cwd: this.directory,
            onlyFiles: true,
            absolute: true
        })) {
            if (!file.includes(this.exclude)) {
                paths.push(file);
            }
        }
        if(paths.length === 0) throw new Error("No files found in the directory");
        if(!Array.isArray(paths)) throw new Error("Result is not an array");
        this.paths = paths;
        console.info("Directory scanned");
    }
    async _importDefaultModules(){
        for (const filePath of this.paths) {
            try {
                const importedModule = await import(filePath);
                const exportedProperties = Object.keys(importedModule);
               
                
                if (exportedProperties.length === 0) 
                    continue;
                if (exportedProperties.length !== 1)
                    continue;
                if (exportedProperties[0] !== 'default')
                    continue;
                
                const moduleName = importedModule.default.name || importedModule.default.constructor.name || filePath.split('/').pop().split('.').shift();
                if(moduleName.length === 0) continue;

                this.exports[moduleName] = importedModule.default;
                console.info(`Module ${filePath} imported successfully`);
            } catch (error) {
                console.error(`Error importing module ${filePath}: ${error.message}`);
            }
        }
        console.info("Modules imported");
    }
    async export(){
        this._validateInput();
        await this._scanDirectory();
        await this._importDefaultModules();
    
        console.info("Exported");
        return this.exports;
    }

}

export default ExportDirectory;