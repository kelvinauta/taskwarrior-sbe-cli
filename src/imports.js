import ExportDirectory from "./helpers/ExportDirectory";

const getModules = async (path) => {
    const exporter = new ExportDirectory(path, ["index.js", "imports.js"], ".js");
    return await exporter.export();
};

const modules = {
    ...await getModules("./src/modules"),
    ...await getModules("./src/helpers"),
};

export default modules;