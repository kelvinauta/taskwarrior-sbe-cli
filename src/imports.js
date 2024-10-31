// import ExportDirectory from "./helpers/ExportDirectory";

// const getModules = async (path) => {
//     const exporter = new ExportDirectory(path, ["index.js", "imports.js"], ".js");
//     return await exporter.export();
// };

// const modules = {
//     ...await getModules("./src/modules"),
//     ...await getModules("./src/helpers"),
// };
import Cmd from "./modules/composers/Cmd.js";
import Time from "./modules/composers/Time.js";
import MonteCarloSimulation from "./modules/services/MonteCarloSimulation.js";
import TaskWarrior from "./modules/services/TaskWarrior.js";


const modules = {
    Cmd,
    Time,
    MonteCarloSimulation,
    TaskWarrior
};
export default modules;
