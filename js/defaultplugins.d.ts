import { TalkToGdb } from ".";
declare type commands = "-symbol-info-type";
declare class Ptypes {
    target: TalkToGdb;
    constructor({ target }: {
        target: TalkToGdb;
    });
    private gettoken;
    init(): Promise<string[]>;
    exec(command: commands, ...args: string[]): string;
}
declare const _default: (typeof Ptypes)[];
export default _default;
//# sourceMappingURL=defaultplugins.d.ts.map