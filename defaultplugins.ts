import { BasePlugin } from "./BasePlugin";
import { getoraddtoken, gettoken, prepareInput } from "./util";
import { GdbParser } from "gdb-parser-extended"
type commands = "-symbol-info-type"

class Ptypes extends BasePlugin {
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
`)
        }
        catch (e) {
            console.error("Initilization of plugin failed!")
            return []
        }
        return ["symbol-info-type"]
    }
    async command(command: commands, ...args: string[]): Promise<string> {
        var { token: realtoken } = getoraddtoken(command)
        this.target.command(realtoken + "0000000-interpreter-exec console", `ptypes ${args.map(prepareInput).join(" ")}`)
            .then((realtoken) => this.target.readPattern({ token: realtoken, type: "sequence" }))
            .then(sequence => {
                var types = sequence.messages
                    .filter((m: any) => m.type == "console_stream_output")
                    .reduce((prev: any, curr: any) => prev + curr.c_line, "")
                var result = {
                    token: realtoken,
                    types: types.split("type = ").filter((type: any) => type),
                }
                this.finishSuccess(result)
            })
        return realtoken;
    }
}

export default [Ptypes]