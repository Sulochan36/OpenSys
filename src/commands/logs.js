import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function logsCommand() {
    const { stdout } = await execFileAsync("journalctl", [
        "-n",
        "20",
        "--no-pager",
    ]);

    console.log(stdout);
}