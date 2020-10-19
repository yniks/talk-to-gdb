import { BasePlugin } from "./BasePlugin";
import { getoraddtoken, gettoken, prepareInput } from "./util";
import { GdbParser } from "gdb-parser-extended"
type commands = "-symbol-info-type"
class ConsoleTypes extends BasePlugin {
    async init() {
        return ["symbol-info-types2"]
    }
    command(command: commands, ...args: string[]): string {
        var { token: realtoken } = getoraddtoken(command)
        this.target.command(realtoken + "0000000-interpreter-exec console", `info types`)
            .then((realtoken) => this.target.readPattern({ token: realtoken, type: "sequence" }))
            .then(async sequence => {
                var types = sequence.messages
                    .filter((m: any) => m.type == "console_stream_output")
                    .reduce((prev: any, curr: any) => prev + curr.c_line, "")
                var types = GdbParser.consoleParseTypes(types.slice(20)).map((file: any) => file.types.map((type: any) => type.type)).flat()
                var extra = types.filter((type: string) => !type.startsWith("typedef ")).map((type: any) => type.type)
                this.target.command(`${realtoken}111-symbol-info-type`, ...extra)
                var sequence = await this.target.readPattern({ token: realtoken + "111", type: "sequence" })
                for (var i in types) {
                    if (!types[i].startsWith("typedef ")) types[i] = sequence.messages.types.shift();
                }
                var result = {
                    token: realtoken,
                    types
                }
                this.finishSuccess(result)
            })
        return realtoken;
    }
}
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
        var { token: realtoken } = getoraddtoken(command)
        this.target.command(realtoken + "0000000-interpreter-exec console", `ptypes ${args.map(prepareInput).join(" ")}`)
            .then((realtoken) => this.target.readPattern({ token: realtoken, type: "sequence" }))
            .then(sequence => {
                var types = sequence.messages
                    .filter((m: any) => m.type == "console_stream_output")
                    .reduce((prev: any, curr: any) => prev + curr.c_line, "")
                var result = {
                    token: realtoken,
                    types: types.split("type = ")
                }
                this.finishSuccess(result)
            })
        return realtoken;
    }
}

export default [Ptypes, ConsoleTypes]