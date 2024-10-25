// Export all files in a directory
import RULES from "rules_list";
import { Glob } from "bun";


class ExportDirectory {
    constructor(directory, exclude = ['index.js'], extensions = '.js'){
        this.directory = directory;
        this.exclude = exclude;
        this.extensions = extensions;
        this.paths = [];
        this.exports = {};
        this.rules = new RULES("ExportDirectory").build();

    }
    _validateInput(){
        const rules = this.rules(".validateInput");
        rules(
            ["Folder path is required", !this.directory],
            ["Folder path must be a string", typeof this.directory !== "string"],
            ["Exclude must be an array of strings", !Array.isArray(this.exclude)],
            ["Exclude all items must be strings", this.exclude.some(item => typeof item !== "string")],
            ["Exclude array cannot be empty", this.exclude.length === 0],
            ["Extensions must be a string", typeof this.extensions !== "string"],
            ["Extensions string cannot be empty", this.extensions.length === 0],
            ["Extensions string must start with a dot", !this.extensions.startsWith('.')],
        );

    }
    async _scanDirectory(){
        const rules = this.rules(".scanDirectory");
        let paths = [];
        const glob = new Glob(`**/*{${this.extensions}}`);
        for await (const file of glob.scan({
            cwd: this.directory,
            onlyFiles: true,
            absolute: true
        })) {
            if (!this.exclude.some(excludeItem => file.includes(excludeItem))) {
                paths.push(file);
            }
        }
        rules(
            ["No files found in the directory", paths.length === 0],
            ["Result is not an array", !Array.isArray(paths)],
        );
        this.paths = paths;
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
                console.error(error);
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