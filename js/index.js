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
const defaultplugins_1 = __importDefault(require("./defaultplugins"));
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
    constructor(arg = {}, plugin = []) {
        super();
        this.overloadedMiCommands = {};
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
        this.#parser = gdb_parser_extended_1.GdbParser;
        var tail = "";
        defaultplugins_1.default.concat(plugin)
            .map(plugin => new plugin({ target: this }))
            .forEach(async (plugin) => (await plugin.init())
            .forEach(command => this.overloadedMiCommands[command] = plugin));
        this.overloadedMiCommands = {};
        this.#process.stdout?.setEncoding("utf-8").on("data", (data) => {
            var lines = data.split("\n");
            lines[0] = tail + lines[0];
            tail = lines.pop() || "";
            lines.forEach((element) => element && this.emit('line', element + "\n"));
        });
        this.on('line', (line) => {
            var miresponse = Object.assign(this.#parser.parseMIrecord(line), { msgid: this.#inMsgCounter++, seqid: this.#inSeqNumber });
            this.emit(miresponse);
            this.emit('object', miresponse);
        });
        this.addListener({ type: 'sequencebreak' }, () => this.#inSeqNumber++);
        let sequence = [];
        let sequenceToken = -1;
        let seqid = -1;
        this.addListener("object", (object) => {
            if (object.type == 'sequencebreak') {
                var data = Object.assign({ token: sequenceToken, seqid, type: 'sequence', messages: sequence });
                this.emit(data);
                this.emit("sequence", data);
                sequence = [];
                seqid = -1;
                sequenceToken = -1;
            }
            else {
                if (object.token) {
                    if (sequenceToken == -1)
                        sequenceToken = object.token;
                    //else if(object.token!=sequenceToken);console.error("WARN:some desprecencies in incoming messeage sequence, a signle token is expected in a single sequence")
                }
                if (seqid == -1 && "seqid" in object)
                    seqid = object.seqid;
                sequence.push(object);
            }
        });
        this.#outMsgCounter = this.#inMsgCounter = this.#inSeqNumber = 0;
    }
    #inMsgCounter;
    #outMsgCounter;
    #inSeqNumber;
    #process;
    #parser;
    escape(str) {
        return str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    }
    prepareInput(arg) {
        arg = arg.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
        if (arg.startsWith("--"))
            return arg;
        else
            return `"${arg}"`;
    }
    gettoken() {
        return Math.random().toString().slice(2);
    }
    /**
     *
     * @param micommand A valid gdb mi3 command
     * @param args Argumnet strngs, `note`: expected unescaped, unquoted
     */
    async command(micommand, ...args) {
        if (micommand in this.overloadedMiCommands) {
            return this.overloadedMiCommands[micommand].exec(micommand, ...args);
        }
        ;
        args = args.map(this.prepareInput);
        var token = (micommand.match(/(\d*)-/) || [])[1];
        if (token === "") {
            token = this.gettoken();
            micommand = token + micommand;
        }
        var command = `${micommand} ${args.join(" ")}\n`;
        await this.write(command);
        return token || "";
    }
    /**
     * write to gdb stdin
     * @param input gdbmi command
     */
    write(input) {
        var token = (input.match(/(\d*)-/) || [])[1];
        if (token === "") {
            token = this.gettoken();
            input = token + input;
        }
        return new Promise((res, rej) => {
            this.#process.stdin?.write(input, (error) => error ? rej(error) : res(token));
        });
    }
    async request(input) {
        var token = await this.write(input);
        return this.readPattern({ token, type: 'result_record' });
    }
    readPattern(pattern, untill = "once") {
        if (untill == "once")
            return new Promise(res => this.once(pattern, (data) => res(data)));
        else {
            var stream = new callback_to_generator_1.EventToGenerator();
            if (untill !== 'forever') {
                this.untill(pattern, untill, stream, () => stream(null));
            }
            else
                this.addListener(pattern, stream);
            return stream;
        }
    }
}
exports.TalkToGdb = TalkToGdb;
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason);
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
});
//# sourceMappingURL=index.js.map