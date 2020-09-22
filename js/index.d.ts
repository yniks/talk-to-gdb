/// <reference types="node" />
import execa from "execa";
import { ChildProcess } from "child_process";
import { EventEmitterExtended, pattern } from "listen-for-patterns";
/**
 * This Class initiates and loads gdb process.
 * This is needed only when the user does not provide a runnin gdb process in `Talk2Gdb` constructor
 */
export declare class GdbInstance {
    targetpath?: string;
    cwd?: string;
    process: execa.ExecaChildProcess;
    constructor(targetpath?: string, cwd?: string);
}
/**
 * Primary Class which implements mechanism to initiate, and communicate with gdb
 */
export declare class TalkToGdb extends EventEmitterExtended {
    #private;
    constructor({ runninggdb, target }: {
        runninggdb?: ChildProcess;
        target?: {
            path: string;
            cwd: string;
        };
    });
    writeln(input: string): Promise<boolean>;
    readln(pattern?: pattern): AsyncIterable<any>;
}
//# sourceMappingURL=index.d.ts.map