import RULES from "rules_list";
import modules from "./imports.js";
import { parseArgs } from "util";


// Usage example:

class App {
    constructor(){
        this.rules = new RULES("App").build();
        this.TaskWarrior = new modules.TaskWarrior();
        this.tasks = [];
    }
    async query(query,override_options_query){
        this.tasks = await this.TaskWarrior.query(query, override_options_query);
        return this.tasks
    }
    async simulate(estimationMs=1000 * 60 * 60 * 2){
        // validate
        const rules = this.rules(".simulate");
        rules(
            ["EstimationMs must be a number", typeof estimationMs !== "number"],
        );
        // logic
        const velocities = this.TaskWarrior.get_velocities(this.tasks);
        const monteCarloSimulation = new modules.MonteCarloSimulation({
            simulatedSteps: 1000,
            intervalMinutes: 15,
            topResultsCount: 10
        }); 
        const simulation = monteCarloSimulation.run({
            velocities: velocities,
            estimationMs
        });
        return simulation;
    }
    async total_time(){
        return this.TaskWarrior.total_time(this.tasks);
    }

}

class CLI {
    constructor(){
        this.rules = new RULES("CLI").build();
        this.app = new App();
        this.args = parseArgs({
            allowPositionals: true,
            args: Bun.argv,
            strict: true,
            options: {
                query: { type: "string", default: "" },
                report: { type: "string", default: "" },
                mode: { type: "string", default: "simulate" }
            }
        });
    }
    _validate_args(){
        const rules = this.rules(".validate_args");
        const available_modes = ["simulate", "total_time"];
        rules(
            ["Mode must be a string", typeof this.args.values.mode !== "string"],
            [`Mode must be a valid mode: ${available_modes.join(", ")}`, !available_modes.includes(this.args.values.mode)],
            ["Query must be a string", typeof this.args.values.query !== "string"], 
            ["Report must be a string", typeof this.args.values.report !== "string"],
        );
        return true;
    }
    async run(){
        // validate
        this._validate_args();
        const rules = this.rules(".run");
        // logic
        const params = [this.args.values.query];
        if(this.args.values.report) params.push({report: this.args.values.report});
        rules(
            ["Params must be an array", !Array.isArray(params)],
            ["Params must have 1 or 2 elements", params.length !== 1 && params.length !== 2],
        );
        await this.app.query(...params);
        
        if(this.args.values.mode === "simulate"){
            return await this.app.simulate();
        }
        if(this.args.values.mode === "total_time"){
            return await this.app.total_time();
        }

    }


}

const cli = new CLI();
cli.run();
