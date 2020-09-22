/// <reference types="node" />
import execa from "execa";
import { ChildProcessWithoutNullStreams } from "child_process";
import { EventEmitterExtended, pattern } from "listen-for-patterns";
/**
 * This Class initiates and loads gdb process.
 * This is required only when the user does not provide a running gdb process in `TalkToGdb` constructor
 */
export declare class GdbInstance {
    file: string;
    cwd: string;
    process: execa.ExecaChildProcess;
    constructor(file: string, cwd?: string);
}
/**
 * Primary Class which implements mechanisms to initiate, and communicate with gdb
 */
export declare class TalkToGdb extends EventEmitterExtended {
    #private;
    constructor(arg: ChildProcessWithoutNullStreams | execa.ExecaChildProcess | {
        target: string | {
            file: string;
            cwd?: string;
        };
    });
    writeln(input: string): Promise<boolean>;
    readln(pattern?: pattern): AsyncIterable<any>;
}
//# sourceMappingURL=index.d.ts.map