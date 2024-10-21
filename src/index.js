import modules from "./imports.js";



// Usage example:

class App {
    constructor(){
        this.rules = new modules.Rules({
            prefix: "App",
            strict: true,
            concatPrefix: true
        });
        this.TaskWarrior = new modules.TaskWarrior();
        this.tasks = [];
    }
    

    async query(query,override_options_query){
        this.tasks = await this.TaskWarrior.query(query, override_options_query);
        return this.tasks
    }
    async simulation(){
        const velocities = this.TaskWarrior.get_velocities(this.tasks);
        const monteCarloSimulation = new modules.MonteCarloSimulation({
            simulatedSteps: 1000,
            intervalMinutes: 15,
            topResultsCount: 10
        }); 
        const simulation = monteCarloSimulation.run({
            velocities: velocities,
            estimationMs: 1000 * 60 * 60 * 1 // 1 hour
        });
        return simulation;
    }
    async total_time(){
        return this.TaskWarrior.total_time(this.tasks);
    }

}
let app = new App();
await app.query("", {
    report: "done_today", 
    // activetime: false,
    // estimate: true
});
const simulation = await app.simulation();


console.log(simulation);
