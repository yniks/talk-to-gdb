import { BaseTalkToGdb } from "./BaseTalkToGdb";
export declare class TalktoGdb extends BaseTalkToGdb {
    waitFor(micommand: string, ...args: string[]): Promise<boolean>;
    getResult(micommand: string, ...args: string[]): Promise<any>;
    getOutput(micommand: string, ...args: string[]): Promise<any>;
    changeFile(newfile: string): Promise<boolean>;
}
//# sourceMappingURL=TalktoGdb.d.ts.map