import { BaseTalkToGdb } from "./BaseTalkToGdb";
export class TalktoGdb extends BaseTalkToGdb {
    async waitFor(micommand: string, ...args: string[]) {
        var result = await this.getResult(micommand, ...args)
        if (result.class === 'error')
            throw "command Failed: " + micommand
        else return true
    }
    async getResult(micommand: string, ...args: string[]) {
        var token = await this.command(micommand, ...args)
        return await this.readPattern({ token, type: "result_record" })

    }
    async getOutput(micommand: string, ...args: string[]): Promise<any> {
        var token = await this.command(micommand, ...args)
        return this.readPattern({ token, type: "sequence" })
    }
    async changeFile(newfile: string) {
        return await this.waitFor(`-file-exec-and-symbols`, newfile)
    }
    // /**
    //  * @depreciated
    //  * Though console commands can be used every where a mi command is supported 
    //  * but this function executes a console command with `-interpreter-exec console `
    //  * @param command Console command including arguments,need to be pre-escaped if required
    //  */
    // async consoleOutput(command: string) {
    //     return this.getOutput(`-interpreter-exec console `, command)
    // }
}