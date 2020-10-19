import { BasePlugin } from "./BasePlugin";
declare type commands = "-symbol-info-type";
declare class Ptypes extends BasePlugin {
    init(): Promise<string[]>;
    command(command: commands, ...args: string[]): Promise<string>;
}
declare const _default: (typeof Ptypes)[];
export default _default;
//# sourceMappingURL=defaultplugins.d.ts.map