import modules from "./modules"



// Usage example:
const simulation = new modules.MonteCarloSimulation();
await simulation.initialize();
const exampleEstimation = 3600000; // 1 hour in milliseconds
simulation.simulate(exampleEstimation);