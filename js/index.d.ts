/// <reference types="node" />
import execa from "execa";
import { ChildProcessWithoutNullStreams } from "child_process";
import { EventEmitterExtended, pattern } from "listen-for-patterns";
/**
 * This Class initiates and loads gdb process.
 * This is required only when the user does not provide a running gdb process in `TalkToGdb` constructor
 */
interface Flavoring<FlavorT> {
    _type?: FlavorT;
}
export declare type Nominal<T, FlavorT> = T & Flavoring<FlavorT>;
declare type messageCounter = Nominal<number, "messageCounter">;
export declare class GdbInstance {
    file: string | undefined;
    cwd: string | undefined;
    process: execa.ExecaChildProcess;
    constructor(file?: string, cwd?: string);
}
/**
 * Primary Class which implements mechanisms to initiate, and communicate with gdb
 */
export declare class TalkToGdb extends EventEmitterExtended {
    #private;
    constructor(arg?: ChildProcessWithoutNullStreams | execa.ExecaChildProcess | {} | {
        target: string | {
            file: string;
            cwd?: string;
        };
    });
    write(input: string): Promise<messageCounter>;
    read(pattern?: pattern): AsyncIterable<any>;
    readUntill(pattern?: pattern, untill?: pattern): AsyncIterable<any>;
    readSequence(seq: messageCounter, pattern?: pattern): AsyncIterable<any>;
}
export {};
//# sourceMappingURL=index.d.ts.map