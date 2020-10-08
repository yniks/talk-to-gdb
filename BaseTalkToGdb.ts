import { GdbParser } from "gdb-parser-extended";
import { ChildProcessWithoutNullStreams } from "child_process";
import { EventEmitterExtended, pattern } from "listen-for-patterns";
import { EventToGenerator } from "callback-to-generator";
import defaultPlugins from "./defaultplugins";
import { BasePlugin } from "./BasePlugin";
import { GdbInstance } from "./GdbInstance";
import { getoraddtoken, prepareInput } from "./util";

/**
 * Primary Class which implements mechanisms to initiate, and communicate with gdb
 */
export class BaseTalkToGdb extends EventEmitterExtended {
    #inMsgCounter: number;
    #inSeqNumber: number;
    #process: ChildProcessWithoutNullStreams;
    #parser: typeof GdbParser;
    plugins: { [command: string]: BasePlugin; };
    async loadPlugins(pluginClasses: BasePlugin & { new(...args: any[]): BasePlugin; }[]) {
        var plugins = pluginClasses.concat(defaultPlugins).map(plugin => new plugin({ target: this, parser: this.#parser }));
        for (let plugin of plugins) {
            var commands = await plugin.init();
            commands.forEach((command: string) => this.plugins[command] = plugin);
        }
    }
    private initlializeBaseListener() {
        var tail = "";
        /**
         * Emit each line seperated from recieved input as line event
         */
        this.#process.stdout.setEncoding("utf-8").on("data", (data: string) => {
            var lines = data.split("\n");
            lines[0] = tail + lines[0];
            tail = lines.pop() || "";
            lines.forEach((element) => element && this.emit('line', element + "\n"));
        });
        /**
         * Parse Each line, and emit an object event
         */
        this.on('line', (line: string) => {
            var miresponse = Object.assign(this.#parser.parseMIrecord(line), { msgid: this.#inMsgCounter++, seqid: this.#inSeqNumber });
            this.emit(miresponse);
            this.emit('object', miresponse);
        });
        this.addListener({ type: 'sequencebreak' }, () => this.#inSeqNumber++);

        /**
         * Sequence Collector,emits sequence event
         */
        let sequence: Object[] = [];
        let sequenceToken: number = -1;
        let seqid: number = -1;
        this.addListener({ type: (type: string) => type != 'sequence' }, (object) => {

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
    constructor(arg: ChildProcessWithoutNullStreams | { file?: string; cwd?: string; } = {}) {
        super();
        if ("stdout" in arg)
            this.#process = arg;
        else
            this.#process = new GdbInstance(arg.file, arg.cwd).process;

        this.#parser = GdbParser;
        this.plugins = {};
        this.#inMsgCounter = this.#inSeqNumber = 0;
        this.initlializeBaseListener();

    }
    /**
     *
     * @param micommand A valid gdb mi3 command
     * @param args Argumnet strngs, `note`: expected unescaped, unquoted
     */
    async command(micommand: string, ...args: string[]): Promise<string> {
        var { token, command, name } = getoraddtoken(micommand);
        if (name in this.plugins)
            return this.plugins[name].command(micommand, ...args);
        else {
            args = args.map(prepareInput);
            await this.write(`${command} ${args.join(" ")}\n`);
            return token;
        }
    }
    /**
     * write to gdb stdin
     * @param input gdbmi command
     */
    protected write(input: string) {
        return new Promise((res, rej) => {
            let waitfordrain: boolean = this.#process.stdin.write(input, (error) => error ? rej(error) : res(waitfordrain));
        });
    }
    readPattern(pattern: pattern, untill?: "once"): Promise<any>;
    readPattern(pattern: pattern, untill: "forever" | pattern): AsyncIterable<any>;
    readPattern(pattern: pattern, untill: "forever" | "once" | pattern = "once"): Promise<any> | AsyncIterable<any> {
        if (untill == "once")
            return new Promise(res => this.once(pattern, (data) => res(data)));
        else {
            var stream = new EventToGenerator();
            if (untill === 'forever')
                this.addListener(pattern, stream as Function as (...args: any[]) => void);

            else
                this.untill(pattern, untill, stream as Function as (...args: any[]) => void, () => stream(null));
            return stream;
        }
    }
}
