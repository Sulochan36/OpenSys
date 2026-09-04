import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function dockerCommand() {
    const { stdout } = await execFileAsync("docker", [
        "ps",
        "--format",
        "{{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}",
    ]);

    if (!stdout.trim()) {
        console.log("No running containers.");
        return;
    }

    console.log("ID\tNAME\tIMAGE\tSTATUS\tPORTS");
    console.log("-------------------------------------------------------------");

    console.log(stdout.trim());
}