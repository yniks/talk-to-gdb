import { BasePlugin } from "./BasePlugin";
declare type commands = "-symbol-info-type";
declare class ConsoleTypes extends BasePlugin {
    init(): Promise<string[]>;
    command(command: commands, ...args: string[]): string;
}
declare const _default: (typeof ConsoleTypes)[];
export default _default;
//# sourceMappingURL=defaultplugins.d.ts.map