import { GdbParser } from "gdb-parser-extended";
import { TalktoGdb } from ".";
export declare abstract class BasePlugin {
    target: TalktoGdb;
    parser: typeof GdbParser;
    constructor({ target, parser }: {
        target: TalktoGdb;
        parser: typeof GdbParser;
    });
    /**
     *  Initiliaze your plugin.
     *  Shall be usufull for asynchrous intilization work
     *  @returns List of commands supported
     */
    abstract init(): Promise<string[]>;
    /**
     *
     * @param command command to execute
     * @param args list of argument for this command
     * @returns token for user
     */
    abstract command(command: string, ...args: string[]): string;
    finishSuccess(object?: {}): void;
    finishFailure(object?: {}): void;
    /**
     *
     * @param object List of Object to be emiited.If array, a sequence break is automatically inserted
     */
    emit(object: Array<any> | Object): void;
}
//# sourceMappingURL=BasePlugin.d.ts.map