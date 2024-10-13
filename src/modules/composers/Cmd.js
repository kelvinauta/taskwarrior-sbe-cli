
class Cmd {
    constructor() {
        
    }
    async runCommand(command){

        // validate
        if(!command) throw new Error("No command was entered");
        if(!Array.isArray(command)) throw new Error("command must be an array");
        if(command.length === 0) throw new Error("command must have at least one element");
        if (!command.every(elem => typeof elem === "string")) throw new Error("All command elements must be strings");
        // logic
        const process = Bun.spawn(command);
        const response = await new Response(process.stdout).text();
        return response;
    }
}

export default Cmd;