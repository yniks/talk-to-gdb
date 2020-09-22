"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalkToGdb = exports.GdbInstance = void 0;
const execa_1 = __importDefault(require("execa"));
const path_1 = __importDefault(require("path"));
const gdb_parser_extended_1 = require("gdb-parser-extended");
const listen_for_patterns_1 = require("listen-for-patterns");
const callback_to_generator_1 = require("callback-to-generator");
/**
 * This Class initiates and loads gdb process.
 * This is required only when the user does not provide a running gdb process in `TalkToGdb` constructor
 */
class GdbInstance {
    constructor(file, cwd) {
        this.file = file;
        this.cwd = cwd || path_1.default.dirname(file);
        this.process = execa_1.default('gdb', ['-q', '-i=mi3', this.file], { cwd: this.cwd });
    }
}
exports.GdbInstance = GdbInstance;
/**
 * Primary Class which implements mechanisms to initiate, and communicate with gdb
 */
class TalkToGdb extends listen_for_patterns_1.EventEmitterExtended {
    constructor(arg) {
        super();
        if ("stdout" in arg) {
            if (!arg.stdout)
                throw "Need a Child Process with an open stdio stream";
            this.#process = arg;
        }
        else if ("target" in arg) {
            if (typeof arg.target == "string")
                this.#process = new GdbInstance(arg.target).process;
            else
                this.#process = new GdbInstance(arg.target.file, arg.target.cwd).process;
        }
        else
            throw "TalkToGdb Class needs to initialized by either a running gdb ChildProcess or a file path which the can be compiled";
        this.#parser = new gdb_parser_extended_1.GdbParser;
        var tail = "";
        this.#process.stdout?.setEncoding("utf-8").on("data", (data) => {
            var lines = (tail + data).split(/([^\n]*?\n)/g);
            tail = lines.pop() || "";
            lines.forEach((element) => element && this.emit('line', element));
        });
        this.on('line', (line) => {
            var miresponse = this.#parser.parseMIrecord(line);
            this.emit(miresponse);
        });
    }
    #process;
    #parser;
    writeln(input) {
        return new Promise((res, rej) => {
            this.#process.stdin?.write(input, (error) => error ? rej(error) : res(true));
        });
    }
    readln(pattern) {
        var stream = new callback_to_generator_1.EventToGenerator();
        this.addListener(pattern || 'line', stream);
        return stream;
    }
}
exports.TalkToGdb = TalkToGdb;
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason);
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
});
//# sourceMappingURL=index.js.map