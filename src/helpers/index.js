// import ExportDirectory from "./ExportDirectory";
// const getHelpers = async (path) => {
//     const exporter = new ExportDirectory(path, "index.js", ".js");
//     return await exporter.export();
// };

// async function runCommand(command){
//     if(!command) throw new Error("No se ingresó un comando");
//     const process = Bun.spawn(command);
//     const response = await new Response(process.stdout).text();
//     return response;
// }
// function formattedIsoDate(isodate){
//     // Example isodate input: 20240901T092013Z
//     return new Date(isodate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z'));
    
// }
// const helpers = {
//     ...await getHelpers("./src/helpers"),
//     runCommand,
//     formattedIsoDate
// };
// console.log(helpers);
// export default helpers
