/// <reference types="node" />
import { ChildProcessWithoutNullStreams } from "child_process";
import { EventEmitterExtended, pattern } from "listen-for-patterns";
import { BasePlugin } from "./BasePlugin";
/**
 * Primary Class which implements mechanisms to initiate, and communicate with gdb
 */
export declare class BaseTalkToGdb extends EventEmitterExtended {
    #private;
    plugins: {
        [command: string]: BasePlugin;
    };
    loadPlugins(pluginClasses?: (BasePlugin & {
        new (...args: any[]): BasePlugin;
    })[]): Promise<void>;
    private initlializeBaseListener;
    constructor(arg?: ChildProcessWithoutNullStreams | {
        file?: string;
        cwd?: string;
    });
    /**
     *
     * @param micommand A valid gdb mi3 command
     * @param args Argumnet strngs, `note`: expected unescaped, unquoted
     */
    command(micommand: string, ...args: string[]): Promise<string>;
    /**
     * write to gdb stdin
     * @param input gdbmi command
     */
    protected write(input: string): Promise<unknown>;
    readPattern(pattern: pattern, untill?: "once"): Promise<any>;
    readPattern(pattern: pattern, untill: "forever" | pattern): AsyncIterable<any>;
}
//# sourceMappingURL=BaseTalkToGdb.d.ts.map