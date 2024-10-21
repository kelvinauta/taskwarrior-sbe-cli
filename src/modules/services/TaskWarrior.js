// import Cmd from "../composers/Cmd";
import modules from "../../imports";
class TaskWarrior {
    constructor() {

        // dependecy injection
        this.cmd = new modules.Cmd();
        this.time = new modules.Time();
        this.rules = new modules.Rules({
            prefix: "TaskWarrior",
            strict: true,
            concatPrefix: true
        });

        // default options
        this.options_query = {
            activetime: true,
            estimate: true,
            report: "" 

        };
    }

    async _build_command_query(query, options){
        // override options
        options = {...this.options_query, ...options};
        // validate
        const rules = this.rules.add_prefix(".build_command_query");
        rules(
            ["Query must be a string", query ? typeof query !== "string" : false], // if query is provided, it must be a string
            ["Options must be an object", typeof options !== "object"],
            ["estimate must be a boolean", typeof options.estimate !== "boolean"],
            ["activetime must be a boolean", typeof options.activetime !== "boolean"],
            ["estimate or activetime must be true", !options.estimate && !options.activetime],
            ["report must be a string", options.report ? typeof options.report !== "string" : false]
        );

        // logic
        let command = ["task"];
        if(options.report) command.push(await this.get_report_filters(options.report));
        if(query) command.push(query);
        // if(options.estimate) command.push("estimate.any:");
        // if(options.activetime) command.push("activetime.any:");
        if(options.estimate || options.activetime){
            command.push("(");
            if(options.estimate) command.push("estimate.any:");
            command.push("or");
            if(options.activetime) command.push("activetime.any:");
            command.push(")");
        }
        command.push("export");
        command = this.cmd.normalizeCommand(command);
        console.log(command);
        return command;
    }
    async query(query, options) {
        // validate
        const rules = this.rules.add_prefix(".query");
        rules(
            ["Query must be a string", query ? typeof query !== "string" : false] // if query is provided, it must be a string
        );

        // logic
   
        let command = await this._build_command_query(query, options);
        const response = await this.cmd.runCommand(command);
        try {
            const tasks = JSON.parse(response); //TODO: handle error
            return tasks;
        } catch (error) {
            console.error(error);
            throw new Error("Error in TaskWarrior.query");
        }
    }
    async get_report_filters(report){
        // validate
        const rules = this.rules.add_prefix("get_report_filters");
        rules(
            ["Report is required", !report],
            ["Report must be a string", typeof report !== "string"]
        );
        // logic
        const filter = `report.${report}.filter`;
        const command = ["task", "show", filter];
        const response = await this.cmd.runCommand(command); //TODO: handle error
        let reportFilter = response.trim();
        // example response find report:
        // ```
        //         Config Variable    Value
        // ------------------ ----------------------------------
        // report.next.filter status:pending -WAITING limit:page
        // ```

        // example response no find report:
        // ```
        // Config Variable Value
        // --------------- -----
        // No matching configuration variables.
        // ```
        if(reportFilter.includes("No matching configuration variables.")) throw new Error(`Report ${report} not found`);
        
        // split the reportFilter into lines
        reportFilter = reportFilter.split("\n");
        // find the line index that contains the filter
        const lineIndex = reportFilter.findIndex(line => line.includes(filter));
        // delete lines before the filter line
        reportFilter = reportFilter.slice(lineIndex);
        
        const default_value_string = "Default value"; 
        // find the line index that contains the default value string
        const default_value_lineIndex = reportFilter.findIndex(line => line.includes(default_value_string));
        // delete lines after the default value
        reportFilter = reportFilter.slice(0, default_value_lineIndex);
        // join the lines
        reportFilter = reportFilter.join("\n");
        // remove the filter from the reportFilter
        reportFilter = reportFilter.replace(filter, "")
        // remove line breaks
        reportFilter = reportFilter.replace(/\n/g, "");
        // trim and remove spaces
        reportFilter = reportFilter.trim().replace(/\s+/g, ' ');
        return reportFilter;
    }
    get_velocities(tasks){
        const rules = this.rules.add_prefix(".get_velocities");
        rules(
            ["Tasks is required", !tasks],
            ["Tasks must be an array", !Array.isArray(tasks)],
            ["Tasks Length must be greater than 0", tasks.length === 0],
            ["Tasks must be an array of objects", tasks.some(task => typeof task !== 'object')],
            ["All Tasks must have estimate", tasks.some(task => !task.estimate)],
            ["All Tasks must have activetime", tasks.some(task => !task.activetime)]
        );
        return tasks.map(task => {
            return this.time.durationToMs(task.estimate) / this.time.durationToMs(task.activetime);
        });
    }
    total_time(tasks){
        const rules = this.rules.add_prefix(".total_time");
        
        rules(
            ["Tasks is required", !tasks],
            ["Tasks must be an array", !Array.isArray(tasks)],
            ["Tasks must be an array of objects", tasks.some(task => typeof task !== 'object')]
        );
        let total_activetime = 0;
        let total_estimate = 0;
        for (const task of tasks) {
            if (task.activetime) {
                total_activetime += this.time.durationToMs(task.activetime);
            }
            if (task.estimate) {
                total_estimate += this.time.durationToMs(task.estimate);
            }
        }
        const text = `Total activetime: ${this.time.msToDuration(total_activetime)}\nTotal estimate: ${this.time.msToDuration(total_estimate)}`;
        console.log(text);
        let result = {
            total_activetime,
            total_estimate
        }
        if(total_activetime > 0) result.total_velocity = total_estimate / total_activetime; 
        return result;
    }
}

export default TaskWarrior;