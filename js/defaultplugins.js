"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BasePlugin_1 = require("./BasePlugin");
const util_1 = require("./util");
class Ptypes extends BasePlugin_1.BasePlugin {
    async init() {
        try {
            await this.target.waitFor(`define ptypes
    set $i = 0
    while $i < $argc
        eval "set $s=$arg%d",$i
        eval "ptype %s",$s
        set $i = $i+1
    end
end
`);
        }
        catch (e) {
            console.error("Initilization of plugin failed!");
            return [];
        }
        return ["symbol-info-type"];
    }
    command(command, ...args) {
        var { token: realtoken } = util_1.getoraddtoken(command);
        this.target.command(realtoken + "0000000-interpreter-exec console", `ptypes ${args.map(util_1.prepareInput).join(" ")}`)
            .then((realtoken) => this.target.readPattern({ token: realtoken, type: "sequence" }))
            .then(sequence => {
            var types = sequence.messages
                .filter((m) => m.type == "console_stream_output")
                .reduce((prev, curr) => prev + curr.c_line, "");
            var result = {
                token: realtoken,
                types: types.split("type = ").filter((type) => type),
            };
            this.finishSuccess(result);
        });
        return realtoken;
    }
}
exports.default = [Ptypes];
//# sourceMappingURL=defaultplugins.js.map