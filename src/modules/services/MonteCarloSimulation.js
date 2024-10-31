import RULES from "rules_list";
import modules from "../../imports"
class MonteCarloSimulation {
    constructor({
       
        simulatedSteps = 1000,
        intervalMinutes = 15,
        topResultsCount = 10
    }) {
        
        // validate
        this.rules = new RULES("MonteCarloSimulation").build();
        const rules = this.rules(".constructor");
        rules(
            ["SimulatedSteps must be a number", typeof simulatedSteps !== "number"],
            ["IntervalMinutes must be a number", typeof intervalMinutes !== "number"],
            ["TopResultsCount must be a number", typeof topResultsCount !== "number"]
        );
        // logic
        this.simulatedSteps = simulatedSteps;
        this.intervalMinutes = intervalMinutes;
        this.topResultsCount = topResultsCount;
        this.time = new modules.Time();

        
       
    }

    run({velocities, estimationMs}) { 

        // validate
        const rules = this.rules(".run");
        rules(
            ["Velocities is required", !velocities],
            ["Velocities must be an array", !Array.isArray(velocities)],
            ["Velocities must be an array of numbers", velocities.some(velocity => typeof velocity !== "number")],
            ["EstimationMs is required", !estimationMs],
            ["EstimationMs must be a number", typeof estimationMs !== "number"] 
        );

        // logic
        let results = {};
        let correctResults = 0;
        for (let i = 0; i < this.simulatedSteps; i++) {
            const randomVelocity = velocities[Math.floor(Math.random() * velocities.length)];
            const simulatedTime = Math.round(estimationMs * randomVelocity);

            const intervalStart = Math.floor(simulatedTime / (this.intervalMinutes * 60000)) * (this.intervalMinutes * 60000);
            const intervalEnd = intervalStart + (this.intervalMinutes * 60000);
            const key = `${this._msToHoursMinutes(intervalStart)} - ${this._msToHoursMinutes(intervalEnd)}`;

            results[key] = (results[key] || 0) + 1;

            if (simulatedTime <= estimationMs) {
                correctResults++;
            }
        }

        const estimationProbability = (correctResults / this.simulatedSteps) * 100;
        results = Object.entries(results) // Top results
            .sort((a, b) => b[1] - a[1])
            .slice(0, this.topResultsCount);

        console.log(`Top ${this.results} most probable intervals:`);
        results.forEach(([interval, occurrences]) => {
            const probability = (occurrences / this.simulatedSteps) * 100;
            console.log(`${interval}: ${probability.toFixed(2)}%`);
        });

        console.log(`\nProbability of the estimation being correct: ${estimationProbability.toFixed(2)}%`);
        console.log(`\nTasks Length: ${velocities.length}`);
        return results;
    }

    _msToHoursMinutes(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }

}

export default MonteCarloSimulation;