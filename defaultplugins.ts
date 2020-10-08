import { BasePlugin } from "./BasePlugin";
import { gettoken, prepareInput } from "./util";

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
    command(command: commands, ...args: string[]): string {
        var realtoken = gettoken()
        this.target.command(realtoken + "-interpreter-exec console", `ptypes ${args.map(prepareInput).join(" ")}`)
            .then((realtoken) => this.target.readPattern({ token: realtoken, type: "sequence" }))
            .then(sequence => {
                var types = sequence.messages
                    .filter((m: any) => m.type == "console_stream_output")
                    .reduce((prev: any, curr: any) => prev + curr.c_line, "")
                var result = {
                    token: realtoken + "00000000",
                    types: types.split("type = ")//GdbParser.consoleParsePtypes(statements)
                }
                this.finishSuccess(result)
            })
        return realtoken + "00000000";
    }
}

export default [Ptypes]