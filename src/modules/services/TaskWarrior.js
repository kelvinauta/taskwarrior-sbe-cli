// import Cmd from "../composers/Cmd";
import RULES from "rules_list";
import modules from "../../imports"
class TaskWarrior {
    constructor() {

        // dependecy injection
        this.cmd = new modules.Cmd();
        this.time = new modules.Time();
        this.rules = new RULES("TaskWarrior").build();

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
        const rules = this.rules(".build_command_query");
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
        const rules = this.rules(".query");
        rules(
            ["Query must be a string", query ? typeof query !== "string" : false] // if query is provided, it must be a string
        );

        // logic
   
        let command = await this._build_command_query(query, options);
        const response = await this.cmd.runCommand(command);
        rules(
            [`bash error: ${command.join(" ")}`, !response],
            [`No Tasks found`, response.trim().replace(/\n/g, "") == "[]"],
        )
        try {
            const tasks = JSON.parse(response); //TODO: handle error
            return tasks;
        } catch (error) {
            rules(
                ["Parsing JSON tasks error", true],
                [error.message, true]
            )
        }
    }
    async get_report_filters(report){
        // validate
        const rules = this.rules(".get_report_filters");
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
        rules(
            ["Report not found", reportFilter.includes("No matching configuration variables.")]
        );
        
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
        const rules = this.rules(".get_velocities");
        const min_tasks_estimate_and_activetime = 10;
        rules(
            ["Tasks is required", !tasks],
            ["Tasks must be an array", !Array.isArray(tasks)],
            ["Tasks Length must be greater than 0", tasks.length === 0],
            ["Tasks must be an array of objects", tasks.some(task => typeof task !== 'object')],
            [`Tasks must have at least ${min_tasks_estimate_and_activetime} tasks with estimate and activetime, found ${tasks.filter(task => task.estimate && task.activetime).length}`, tasks.filter(task => task.estimate && task.activetime).length < min_tasks_estimate_and_activetime]
        );
        const tasks_with_estimate_and_activetime = tasks.filter(task => task.estimate && task.activetime);
        return tasks_with_estimate_and_activetime.map(task => {
            return this.time.durationToMs(task.estimate) / this.time.durationToMs(task.activetime);
        });
    }
    total_time(tasks){
        const rules = this.rules(".total_time");
        
        rules(
            ["Tasks is required", !tasks],
            ["Tasks must be an array", !Array.isArray(tasks)],
            ["Tasks must be an array of objects", tasks.some(task => typeof task !== 'object')]
        );
        let raw_total_activetime = 0;
        let raw_total_estimate = 0;
        let total_activetime = 0;
        let total_estimate = 0;
        for (const task of tasks) {
            if (task.activetime) {
                raw_total_activetime += this.time.durationToMs(task.activetime);
                if(task.estimate) total_activetime += this.time.durationToMs(task.activetime);
            }
            if (task.estimate) {
                raw_total_estimate += this.time.durationToMs(task.estimate);
                if(task.activetime) total_estimate += this.time.durationToMs(task.estimate);
            }
        }
 
        let result = {
            raw_total_activetime,
            raw_total_estimate,
            total_activetime,
            total_estimate
        }
        if(result.total_activetime > 0) {
            const tasks_with_estimate_and_activetime = tasks.filter(task => task.estimate && task.activetime);
            
            result.total_velocity = result.total_estimate / result.total_activetime; 
        }
        
        // const text = `Raw Total activetime: ${this.time.msToDuration(result.raw_total_activetime)}\nRaw Total estimate: ${this.time.msToDuration(result.raw_total_estimate)}${result.total_velocity ? `\nTotal velocity: ${result.total_velocity}` : ""}`;
        let text = "";
        if(result.raw_total_activetime > 0) text += `Raw Total activetime: ${this.time.msToDuration(result.raw_total_activetime)}\n`;
        if(result.raw_total_estimate > 0) text += `Raw Total estimate: ${this.time.msToDuration(result.raw_total_estimate)}\n`;
        if(result.total_activetime > 0) text += `\nTotal activetime: ${this.time.msToDuration(result.total_activetime)}\n`;   
        if(result.total_estimate > 0) text += `Total estimate: ${this.time.msToDuration(result.total_estimate)}\n`;
        if(result.total_velocity) text += `Total velocity: ${result.total_velocity}\n`;
        console.log(text);
        return result;
    }
}

export default TaskWarrior;