"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalktoGdb = void 0;
const BaseTalkToGdb_1 = require("./BaseTalkToGdb");
class TalktoGdb extends BaseTalkToGdb_1.BaseTalkToGdb {
    async waitFor(micommand, ...args) {
        var result = await this.getResult(micommand, ...args);
        if (result.class !== 'done')
            throw "command Failed: " + micommand;
        else
            return true;
    }
    async getResult(micommand, ...args) {
        var token = await this.command(micommand, ...args);
        return await this.readPattern({ token, type: "result_record" });
    }
    async getOutput(micommand, ...args) {
        var token = await this.command(micommand, ...args);
        return this.readPattern({ token, type: "sequence" });
    }
    async changeFile(newfile) {
        return await this.waitFor(`-file-exec-and-symbols`, newfile);
    }
}
exports.TalktoGdb = TalktoGdb;
//# sourceMappingURL=TalktoGdb.js.map