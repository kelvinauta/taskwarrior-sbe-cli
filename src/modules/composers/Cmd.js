import RULES from "rules_list";
import modules from "../../imports.js";
class Cmd {
    constructor() {
        this.rules = new RULES("Cmd").build();
    }
    async runCommand(command){

        // validate
        const rules = this.rules(".runCommand");
        rules(
            ["Command must be a Array", !Array.isArray(command)],
            ["Command must not be empty", command.length === 0],
            ["Elements of command must be strings", command.some(elem => typeof elem !== "string")],
            ["Elements of command must not be empty", command.some(elem => elem.trim() === "")],
            ["Elements of command must not contain spaces", command.some(elem => elem.includes(" "))],
        );

  
        // logic
        const process = Bun.spawn(command);
        const response = await new Response(process.stdout).text();
        return response;
    }
    normalizeCommand(command){
        // validate
        const rules = this.rules(".normalizeCommand");
        rules(
            ["Command must be a Array", !Array.isArray(command)],
            ["Command must not be empty", command.length === 0],
        );

        // logic
        let normalized_command = [];
        for(let cmd of command){
            if(cmd.trim() === "") continue;
            // Eliminar espacios entre paréntesis iguales
            cmd = cmd.replace(/(\()\s+(?=\()|(\))\s+(?=\))/g, '$1$2');
            // split by spaces
            cmd = cmd.split(" ");
            normalized_command.push(...cmd);
        }
        // logic
        return normalized_command;
    }
}

export default Cmd;