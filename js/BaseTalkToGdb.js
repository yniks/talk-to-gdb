"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTalkToGdb = void 0;
const gdb_parser_extended_1 = require("gdb-parser-extended");
const listen_for_patterns_1 = require("listen-for-patterns");
const callback_to_generator_1 = require("callback-to-generator");
const defaultplugins_1 = __importDefault(require("./defaultplugins"));
const GdbInstance_1 = require("./GdbInstance");
const util_1 = require("./util");
/**
 * Primary Class which implements mechanisms to initiate, and communicate with gdb
 */
class BaseTalkToGdb extends listen_for_patterns_1.EventEmitterExtended {
    constructor(arg = {}) {
        super();
        if ("stdout" in arg)
            this.#process = arg;
        else
            this.#process = new GdbInstance_1.GdbInstance(arg.file, arg.cwd).process;
        this.#parser = gdb_parser_extended_1.GdbParser;
        this.plugins = {};
        this.#inMsgCounter = this.#inSeqNumber = 0;
        this.initlializeBaseListener();
    }
    #inMsgCounter;
    #inSeqNumber;
    #process;
    #parser;
    async loadPlugins(pluginClasses = []) {
        var plugins = pluginClasses.concat(defaultplugins_1.default).map(plugin => new plugin({ target: this, parser: this.#parser }));
        for (let plugin of plugins) {
            var commands = await plugin.init();
            commands.forEach((command) => this.plugins[command] = plugin);
        }
    }
    initlializeBaseListener() {
        var tail = "";
        /**
         * Emit each line seperated from recieved input as line event
         */
        this.#process.stdout.setEncoding("utf-8").on("data", (data) => {
            var lines = data.split("\n");
            lines[0] = tail + lines[0];
            tail = lines.pop() || "";
            lines.forEach((element) => element && this.emit('line', element + "\n"));
        });
        /**
         * Parse Each line, and emit an object event
         */
        this.on('line', (line) => {
            var miresponse = Object.assign(this.#parser.parseMIrecord(line), { msgid: this.#inMsgCounter++, seqid: this.#inSeqNumber });
            this.emit(miresponse);
            this.emit('object', miresponse);
        });
        this.addListener({ type: 'sequencebreak' }, () => this.#inSeqNumber++);
        /**
         * Sequence Collector,emits sequence event
         */
        let sequence = [];
        let sequenceToken = -1;
        let seqid = -1;
        this.addListener({ type: (type) => type != 'sequence' }, (object) => {
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
    }
    /**
     *
     * @param micommand A valid gdb mi3 command
     * @param args Argumnet strngs, `note`: expected unescaped, unquoted
     */
    async command(micommand, ...args) {
        var { token, command, name } = util_1.getoraddtoken(micommand);
        if (name in this.plugins)
            return this.plugins[name].command(micommand, ...args);
        else {
            args = args.map(util_1.prepareInput);
            await this.write(`${command} ${args.join(" ")}\n`);
            return token;
        }
    }
    /**
     * write to gdb stdin
     * @param input gdbmi command
     */
    write(input) {
        return new Promise((res, rej) => {
            let waitfordrain = this.#process.stdin.write(input, (error) => error ? rej(error) : res(waitfordrain));
        });
    }
    readPattern(pattern, untill = "once") {
        if (untill == "once")
            return new Promise(res => this.once(pattern, (data) => res(data)));
        else {
            var stream = new callback_to_generator_1.EventToGenerator();
            if (untill === 'forever')
                this.addListener(pattern, stream);
            else
                this.untill(pattern, untill, stream, () => stream(null));
            return stream;
        }
    }
}
exports.BaseTalkToGdb = BaseTalkToGdb;
//# sourceMappingURL=BaseTalkToGdb.js.map