import Cmd from "../composers/Cmd";

class TaskWarrior {
    constructor() {

        // dependecy injection
        this.cmd = new Cmd();
    }
    async query(query) {
        // validate
        if(!query) throw new Error("query is required");
        if(typeof query !== "string") throw new Error("query must be a string");

        // logic
        const command = [
            "task", 
            ...query.split(" ").filter(elem => elem !== "" && elem !== "\n"),
            "estimate.any:",
            "activetime.any:",
            "export"
        ];

        const response = await this.cmd.runCommand(command);
        try {
            return JSON.parse(response);
        } catch (error) {
            throw new Error("Invalid JSON response from TaskWarrior");
        }
    }
}

export default TaskWarrior;