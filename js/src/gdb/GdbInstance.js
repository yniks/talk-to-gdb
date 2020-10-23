"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GdbInstance = void 0;
const execa_1 = __importDefault(require("execa"));
const path_1 = __importDefault(require("path"));
class GdbInstance {
    constructor(file = "", cwd = "", mi = "mi3") {
        this.cwd = cwd || path_1.default.dirname(file || "");
        this.file = file;
        var args = ['-q'];
        if (mi)
            args.push("-i=" + mi);
        if (typeof file !== 'undefined')
            args.push(file);
        this.process = execa_1.default('gdb', args, { cwd: this.cwd });
    }
}
exports.GdbInstance = GdbInstance;
//# sourceMappingURL=GdbInstance.js.map