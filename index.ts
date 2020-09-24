import execa from "execa"
import path from "path"
import { GdbParser } from "gdb-parser-extended"
import { ChildProcessWithoutNullStreams,ChildProcess } from "child_process"
import { EventEmitterExtended,pattern } from "listen-for-patterns"
import {EventToGenerator } from "callback-to-generator"
/**
 * This Class initiates and loads gdb process.
 * This is required only when the user does not provide a running gdb process in `TalkToGdb` constructor
 */
export class GdbInstance {
    public file: string|undefined
    public cwd: string|undefined
    public process: execa.ExecaChildProcess
    constructor(file?: string , cwd?: string) {
       if (file)
       {
            this.file = file
            this.cwd = cwd || path.dirname(file)
            this.process = execa('gdb', ['-q', '-i=mi3', this.file], { cwd: this.cwd })
       }
       else if (cwd)
            {
                this.cwd = cwd 
                this.process = execa('gdb', ['-q', '-i=mi3'], { cwd: this.cwd })
            }
       else  this.process = execa('gdb', ['-q', '-i=mi3'])
    }
}
/**
 * Primary Class which implements mechanisms to initiate, and communicate with gdb
 */
export class TalkToGdb extends EventEmitterExtended {
    #process:ChildProcessWithoutNullStreams|execa.ExecaChildProcess
    #parser:GdbParser
    constructor(arg: ChildProcessWithoutNullStreams|execa.ExecaChildProcess|{}|{ target:string|{file:string,cwd?:string}}={}) {
            super()
            if ("stdout" in arg ){
                if (!arg.stdout)throw "Need a Child Process with an open stdio stream"
                this.#process=arg
            }
            else if("target" in arg )
            {
                if (typeof arg.target=="string")
                    this.#process =new GdbInstance(arg.target).process 
                else this.#process =new GdbInstance(arg.target.file ,arg.target.cwd).process
            }
            else  this.#process =new GdbInstance().process //throw "TalkToGdb Class needs to initialized by either a running gdb ChildProcess or a file path which the can be compiled"
            this.#parser=new GdbParser
            var tail="";
            this.#process.stdout?.setEncoding("utf-8").on("data",(data:string)=>
            {
                var lines=(tail+data).split(/([^\n]*?\n)/g)
                tail=lines.pop()||""
                lines.forEach((element) => element&&this.emit('line',element) );
            })
            this.on('line',(line)=>{
                var miresponse=this.#parser.parseMIrecord(line)
                this.emit(miresponse)
            })  
    }
    write(input:string):Promise<boolean>
    {
           return new Promise((res,rej)=>{
                this.#process.stdin?.write(input,(error)=>error?rej(error):res(true))
           })
    }
    read(pattern?:pattern):AsyncIterable<any>
    {
        var stream=new EventToGenerator() 
        this.addListener(pattern||'line',stream as Function as (...args: any[]) => void)
        return stream
    }
    readUntill(pattern?:pattern,untill:pattern={ type:'sequencebreak'}):AsyncIterable<any>
    {
        var stream=new EventToGenerator() 
        this.untill(pattern||'line',untill,stream as Function as (...args: any[]) => void)
        return stream
    }
}

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:',  reason)
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
  })