import execa from "execa"
import path from "path"
import { GdbParser } from "parse-gdb"
import { ChildProcess } from "child_process"
import { EventEmitterExtended } from "./extended-events"

/**
 * This Class initiates and loads gdb process.
 * This is needed only when the user does not provide a runnin gdb process in `Talk2Gdb` constructor
 */
export class GdbInstance {
    public targetpath?: string
    public cwd?: string
    public process: execa.ExecaChildProcess
    constructor(targetpath: string = "", cwd?: string) {
        this.targetpath = targetpath ? path.basename(targetpath) : ''
        this.cwd = cwd || path.dirname(targetpath)
        this.process = execa('gdb', ['-q', '-i=mi3', this.targetpath], { cwd: this.cwd })
    }
}
/**
 * Primary Class which implements mechanism to initiate, and communicate with gdb
 */
export class TalkToGdb extends EventEmitterExtended {
    #process:ChildProcess
    #parser=new GdbParser
    constructor({runninggdb,target}: {runninggdb?: ChildProcess, target?:{path:string,cwd:string}}) {
            super({captureRejections:true})
            if (typeof runninggdb=="undefined"){
                this.#process =new GdbInstance(target?.path ,target?.cwd).process
            }
            else this.#process=runninggdb
            var tail:string="";
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
    async writeln(input:string):Promise<boolean>
    {
           return new Promise((res,rej)=>{
                this.#process.stdin?.write(input,(error)=>error?rej(error):res(true))
           })
    }
    async readline()
    {
        
    }
}

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:',  reason)
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
  })