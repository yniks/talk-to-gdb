import execa from "execa"
import path from "path"
import { GdbParser } from "gdb-parser-extended"
import { ChildProcessWithoutNullStreams, ChildProcess } from "child_process"
import { EventEmitterExtended, pattern } from "listen-for-patterns"
import { EventToGenerator } from "callback-to-generator"
/**
 * This Class initiates and loads gdb process.
 * This is required only when the user does not provide a running gdb process in `TalkToGdb` constructor
 */
interface Flavoring<FlavorT> {
    _type?: FlavorT;
}
export type Nominal<T, FlavorT> = T & Flavoring<FlavorT>;
type messageCounter = Nominal<number, "messageCounter">
type sequenceCounter = Nominal<number, "sequenceCounter">
export class GdbInstance {
    public file: string | undefined
    public cwd: string | undefined
    public process: execa.ExecaChildProcess
    constructor(file?: string, cwd?: string) {
        if (file) {
            this.file = file
            this.cwd = cwd || path.dirname(file)
            this.process = execa('gdb', ['-q', '-i=mi3', this.file], { cwd: this.cwd })
        }
        else if (cwd) {
            this.cwd = cwd
            this.process = execa('gdb', ['-q', '-i=mi3'], { cwd: this.cwd })
        }
        else this.process = execa('gdb', ['-q', '-i=mi3'])
    }
}
/**
 * Primary Class which implements mechanisms to initiate, and communicate with gdb
 */
export class TalkToGdb extends EventEmitterExtended {
    #inMsgCounter: messageCounter
    #outMsgCounter: messageCounter
    #inSeqNumber: messageCounter
    #process: ChildProcessWithoutNullStreams | execa.ExecaChildProcess
    #parser: GdbParser
    private gettoken(): Nominal<string, "token"> {
        return Math.random().toString().slice(2)
    }
    constructor(arg: ChildProcessWithoutNullStreams | execa.ExecaChildProcess | {} | { target: string | { file: string, cwd?: string } } = {}) {
        super()
        if ("stdout" in arg) {
            if (!arg.stdout) throw "Need a Child Process with an open stdio stream"
            this.#process = arg
        }
        else if ("target" in arg) {
            if (typeof arg.target == "string")
                this.#process = new GdbInstance(arg.target).process
            else this.#process = new GdbInstance(arg.target.file, arg.target.cwd).process
        }
        else this.#process = new GdbInstance().process //throw "TalkToGdb Class needs to initialized by either a running gdb ChildProcess or a file path which the can be compiled"
        this.#parser = new GdbParser
        var tail = "";
        this.#process.stdout?.setEncoding("utf-8").on("data", (data: string) => {
            var lines = data.split("\n")
            lines[0] = tail + lines[0];
            tail = lines.pop() || ""
            lines.forEach((element) => element && this.emit('line', element + "\n"));
        })
        this.on('line', (line) => {
            var miresponse = Object.assign(this.#parser.parseMIrecord(line), { msgid: this.#inMsgCounter++, seqid: this.#inSeqNumber })
            this.emit(miresponse)
            this.emit('object', miresponse)
        })
        this.addListener({ type: 'sequencebreak' }, () => this.#inSeqNumber++)


        let sequence: Object[] = []
        let sequenceToken: messageCounter = -1
        let seqid: messageCounter = -1
        this.addListener("object", (object) => {

            if (object.type == 'sequencebreak') {
                var data = Object.assign({ token: sequenceToken, seqid, type: 'sequence', messages: sequence })
                this.emit(data)
                this.emit("sequence", data)
                sequence = []
                seqid = -1
                sequenceToken = -1
            }
            else {
                if (object.token) {
                    if (sequenceToken == -1)
                        sequenceToken = object.token;
                    //else if(object.token!=sequenceToken);console.error("WARN:some desprecencies in incoming messeage sequence, a signle token is expected in a single sequence")
                }
                if (seqid == -1 && "seqid" in object) seqid = object.seqid
                sequence.push(object)
            }
        })
        this.#outMsgCounter = this.#inMsgCounter = this.#inSeqNumber = 0

    }
    /**
     * write to gdb stdin
     * @param input gdbmi command
     */
    write(input: string): Promise<messageCounter> {
        var token = (input.match(/(\d*)-/) || [])[1] as string | undefined
        if (token === "") {
            token = this.gettoken()
            input = token + input
        }
        return new Promise((res, rej) => {
            this.#process.stdin?.write(input, (error) => error ? rej(error) : res(Number(token)))
        })
    }
    async request(input: string): Promise<any> {
        var token = await this.write(input);
        return this.readPattern({ token, type: (s: string) => s != 'sequence' })
    }
    readPattern(pattern: pattern, untill?: Nominal<"once", "">): Promise<any>
    readPattern(pattern: pattern, untill: Nominal<"forever", ""> | pattern): AsyncIterable<any>
    readPattern(pattern: pattern, untill: Nominal<"forever", ""> | Nominal<"once", ""> | pattern = "once"): Promise<any> | AsyncIterable<any> {
        if (untill == "once")
            return new Promise(res => this.once(pattern, (data) => res(data)))
        else {
            var stream = new EventToGenerator()
            if (untill !== 'forever') {
                this.untill(pattern, untill, stream as Function as (...args: any[]) => void, () => stream(null))
            }
            else
                this.addListener(pattern, stream as Function as (...args: any[]) => void);
            return stream
        }
    }
    // /**
    //  * 
    //  * @param pattern this pattern will be matched against the sequence object being emitted
    //  */
    // readSequence(pattern: pattern, untill?:Nominal<"once",""> ):Promise<any>
    // readSequence(pattern:pattern,untill:Nominal<"forever","">|pattern): AsyncIterable<any> 
    // readSequence(pattern: pattern, untill: Nominal<"forever","">|Nominal<"once","">|pattern="once" ):Promise<any>|AsyncIterable<any>
    // {
    //     if(typeof untill=='object')
    //         if("seqid" in untill && untill.seqid <this.#inSeqNumber)console.error("readSequence might be waiting for a message that might never arrive!");
    //     return this.readPattern(Object.assign(pattern,{type:"sequence"}),untill)
    // }
}

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason)
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
})