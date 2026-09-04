import { getProcesses } from "../utils/proc.js";

export async function processesCommand() {
    const sortBy =
        process.argv
            .find((arg) => arg.startsWith("--sort="))
            ?.split("=")[1] || "cpu";

    if (sortBy !== "cpu" && sortBy !== "memory") {
        console.error(`Invalid sort option: ${sortBy}`);
        console.error("Use --sort=cpu or --sort=memory.");
        return;
    }

    const limitArg = process.argv
        .find((arg) => arg.startsWith("--limit="))
        ?.split("=")[1];

    const limit = limitArg ? Number(limitArg) : null;

    const processes = await getProcesses(sortBy, limit);

    console.log(`Processes (sorted by ${sortBy})`);
    console.log("PID\tNAME\t\tSTATE\tCPU\tMEMORY");
    console.log("---------------------------------------------------------------");

    for (const process of processes) {
        console.log(
            `${process.pid}\t${process.name}\t\t${process.state}\t${process.cpu.toFixed(2)}%\t${formatMemory(process.memory)}`
        );
    }
}

function formatMemory(kb) {
    if (kb >= 1024) {
        return `${(kb / 1024).toFixed(1)} MB`;
    }

    return `${kb} kB`;
}