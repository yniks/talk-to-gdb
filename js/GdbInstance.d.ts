/// <reference types="node" />
import { ChildProcessWithoutNullStreams } from "child_process";
export declare class GdbInstance {
    file: string;
    cwd: string;
    process: ChildProcessWithoutNullStreams;
    constructor(file?: string, cwd?: string, mi?: false | "mi2" | "mi3");
}
//# sourceMappingURL=GdbInstance.d.ts.map