import modules from "../index";

class MonteCarloSimulation {
    constructor() {
        this.velocities = [];

        // inject dependencies
        this.taskWarrior = new modules.TaskWarrior();
        this.time = new modules.Time();
       
    }

    async initialize() {
        const tasks = await this.taskWarrior.query("status:completed project:");
        this.velocities = tasks.map(task => {
            return this.time.durationToMs(task.estimate) / this.time.durationToMs(task.activetime);
        });
    }

    simulate(estimationMs) {
        const simulatedSteps = 10000;
        const intervalMinutes = 15;
        const topResultsCount = 20;
        const results = {};
        let correctResults = 0;

        for (let i = 0; i < simulatedSteps; i++) {
            const randomVelocity = this.velocities[Math.floor(Math.random() * this.velocities.length)];
            const simulatedTime = Math.round(estimationMs * randomVelocity);

            const intervalStart = Math.floor(simulatedTime / (intervalMinutes * 60000)) * (intervalMinutes * 60000);
            const intervalEnd = intervalStart + (intervalMinutes * 60000);
            const key = `${this.msToHoursMinutes(intervalStart)} - ${this.msToHoursMinutes(intervalEnd)}`;

            results[key] = (results[key] || 0) + 1;

            if (simulatedTime <= estimationMs) {
                correctResults++;
            }
        }

        const estimationProbability = (correctResults / simulatedSteps) * 100;
        const topResults = Object.entries(results)
            .sort((a, b) => b[1] - a[1])
            .slice(0, topResultsCount);

        console.log(`Top ${topResultsCount} most probable intervals:`);
        topResults.forEach(([interval, occurrences]) => {
            const probability = (occurrences / simulatedSteps) * 100;
            console.log(`${interval}: ${probability.toFixed(2)}%`);
        });

        console.log(`\nProbability of the estimation being correct: ${estimationProbability.toFixed(2)}%`);
    }

    msToHoursMinutes(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }
}

export default MonteCarloSimulation;