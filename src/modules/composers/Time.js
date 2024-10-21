class Time {
    constructor(){}
    durationToMs(duration){
        // validate

        // example duration: PT1H
        if(!duration) throw new Error("No duration was entered");
        if(typeof duration !== "string") throw new Error("duration must be a string");
        if(duration.length === 0) throw new Error("duration cannot be an empty string");
        if(duration.trim() === "") throw new Error("duration cannot be only whitespace");

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
        if(typeof result !== "number") throw new Error("Invalid result of durationToMs");
        if(result < 0) throw new Error("Invalid result of durationToMs");

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