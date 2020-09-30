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
    private escape;
    private prepareInput;
    private gettoken;
    constructor(arg?: ChildProcessWithoutNullStreams | execa.ExecaChildProcess | {} | {
        target: string | {
            file: string;
            cwd?: string;
        };
    });
    overloadedMiCommands: string[];
    /**
     *
     * @param micommand A valid gdb mi3 command
     * @param args Argumnet strngs, `note`: expected unescaped, unquoted
     */
    command(micommand: string, ...args: string[]): Promise<messageCounter>;
    /**
     * write to gdb stdin
     * @param input gdbmi command
     */
    write(input: string): Promise<messageCounter>;
    request(input: string): Promise<any>;
    readPattern(pattern: pattern, untill?: Nominal<"once", "">): Promise<any>;
    readPattern(pattern: pattern, untill: Nominal<"forever", ""> | pattern): AsyncIterable<any>;
}
export {};
//# sourceMappingURL=index.d.ts.map