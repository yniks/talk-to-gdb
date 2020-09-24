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
class GdbInstance {
    constructor(file, cwd) {
        if (file) {
            this.file = file;
            this.cwd = cwd || path_1.default.dirname(file);
            this.process = execa_1.default('gdb', ['-q', '-i=mi3', this.file], { cwd: this.cwd });
        }
        else if (cwd) {
            this.cwd = cwd;
            this.process = execa_1.default('gdb', ['-q', '-i=mi3'], { cwd: this.cwd });
        }
        else
            this.process = execa_1.default('gdb', ['-q', '-i=mi3']);
    }
}
exports.GdbInstance = GdbInstance;
/**
 * Primary Class which implements mechanisms to initiate, and communicate with gdb
 */
class TalkToGdb extends listen_for_patterns_1.EventEmitterExtended {
    constructor(arg = {}) {
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
            this.#process = new GdbInstance().process; //throw "TalkToGdb Class needs to initialized by either a running gdb ChildProcess or a file path which the can be compiled"
        this.#parser = new gdb_parser_extended_1.GdbParser;
        var tail = "";
        this.#process.stdout?.setEncoding("utf-8").on("data", (data) => {
            var lines = (tail + data).split(/([^\n]*?\n)/g);
            tail = lines.pop() || "";
            lines.forEach((element) => element && this.emit('line', element));
        });
        this.on('line', (line) => {
            var miresponse = Object.assign(this.#parser.parseMIrecord(line), { msgid: this.#inMsgCounter++, seqid: this.#inSeqNumber });
            this.emit(miresponse);
        });
        this.addListener({ type: 'sequencebreak' }, () => this.#inSeqNumber++);
        this.#outMsgCounter = this.#inMsgCounter = this.#inSeqNumber = 0;
    }
    #inMsgCounter;
    #outMsgCounter;
    #inSeqNumber;
    #process;
    #parser;
    write(input) {
        return new Promise((res, rej) => {
            this.#process.stdin?.write(input, (error) => error ? rej(error) : res(this.#outMsgCounter++));
        });
    }
    read(pattern) {
        var stream = new callback_to_generator_1.EventToGenerator();
        this.addListener(pattern || 'line', stream);
        return stream;
    }
    readUntill(pattern, untill = { type: 'sequencebreak' }) {
        var stream = new callback_to_generator_1.EventToGenerator();
        this.untill(pattern || 'line', untill, stream);
        return stream;
    }
    readSequence(seq, pattern = {}) {
        return this.readUntill(Object.assign(pattern, { seqid: seq }), { seqid: seq + 1 });
    }
}
exports.TalkToGdb = TalkToGdb;
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason);
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
});
//# sourceMappingURL=index.js.map