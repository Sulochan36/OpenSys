import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function servicesCommand() {
    const { stdout } = await execFileAsync("systemctl", [
        "list-units",
        "--type=service",
        "--no-pager",
        "--no-legend",
    ]);

    const services = stdout
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => {
            const parts = line.trim().split(/\s+/);

            return {
                unit: parts[0],
                load: parts[1],
                active: parts[2],
                sub: parts[3],
            };
        });

    console.log("SERVICE\t\tACTIVE\tSTATE");
    console.log("----------------------------------------");

    for (const service of services.slice(0, 20)) {
        console.log(
            `${service.unit}\t${service.active}\t${service.sub}`
        );
    }
}