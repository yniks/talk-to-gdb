import execa from "execa";
import path from "path";
import { ChildProcessWithoutNullStreams } from "child_process";

export class GdbInstance {
    public file: string;
    public cwd: string;
    public process: ChildProcessWithoutNullStreams;
    constructor(file: string = "", cwd: string = "", mi: false | "mi2" | "mi3" = "mi3") {
        this.cwd = cwd || path.dirname(file || "");
        this.file = file;
        var args = ['-q'];
        if (mi)
            args.push("-i=" + mi);
        if (typeof file !== 'undefined')
            args.push(file);
        this.process = execa('gdb', args, { cwd: this.cwd }) as ChildProcessWithoutNullStreams;
    }
}
