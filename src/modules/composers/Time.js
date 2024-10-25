import RULES from "rules_list";

class Time {
    constructor(){
        this.rules = new RULES("Time").build();
    }
    durationToMs(duration){
        // validate
        const rules = this.rules(".durationToMs");
        // example duration: PT1H
        rules(
            ["No duration was entered", !duration],
            ["duration must be a string", typeof duration !== "string"],
            ["duration cannot be an empty string", duration.length === 0],
            ["duration cannot be only whitespace", duration.trim() === ""],
        );

        // logic
        const regex = /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
        const matches = duration.match(regex);
        if (!matches) {
            return 0;
        }
        const [_, years, months, days, hours, minutes, seconds] = matches.map(m => m ? Number(m) : 0);

        const result = (
            (years * 365 * 24 * 60 * 60 * 1000) +
            (months * 30 * 24 * 60 * 60 * 1000) + 
            (days * 24 * 60 * 60 * 1000) +
            (hours * 60 * 60 * 1000) +
            (minutes * 60 * 1000) +
            (seconds * 1000)
        );

        // validate output
        rules(
            ["Invalid result of durationToMs", typeof result !== "number"],
            ["Invalid result of durationToMs", result < 0],
        );  

        // return
        return result;
    }
    msToDuration(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
        
    }
    msToHoursMinutes(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }
}

export default Time;