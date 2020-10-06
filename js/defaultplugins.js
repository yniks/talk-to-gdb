"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Ptypes {
    constructor({ target }) {
        this.target = target;
    }
    gettoken() {
        return Math.random().toString().slice(2);
    }
    async init() {
        var data = await this.target.request(`define ptypes
    set $i = 0
    while $i < $argc
        eval "set $s=$arg%d",$i
        eval "ptype %s",$s
        set $i = $i+1
    end
end
`);
        if (data.class !== 'done')
            throw "Intialization failed";
        return ["-symbol-info-type"];
    }
    exec(command, ...args) {
        var realtoken = this.gettoken();
        this.target.command(realtoken + "-interpreter-exec console", `ptypes ${args.map(this.target.prepareInput).join(" ")}`)
            .then((realtoken) => this.target.readPattern({ token: realtoken, type: "sequence" }))
            .then(sequence => this.target.emit(Object.assign(sequence, { token: realtoken + 0 })));
        return realtoken + 0;
    }
}
exports.default = [Ptypes];
//# sourceMappingURL=defaultplugins.js.map