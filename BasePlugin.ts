import { GdbParser } from "gdb-parser-extended"
import { TalktoGdb } from "."

export abstract class BasePlugin {
    target: TalktoGdb
    parser: typeof GdbParser
    constructor({ target, parser }: { target: TalktoGdb, parser: typeof GdbParser }) {
        this.target = target
        this.parser = parser
    }
    /**
     *  Initiliaze your plugin.
     *  Shall be usufull for asynchrous intilization work
     *  @returns List of commands supported
     */
    abstract async init(): Promise<string[]>
    /**
     * 
     * @param command command to execute
     * @param args list of argument for this command
     * @returns token for user
     */
    abstract command(command: string, ...args: string[]): string
    finishSuccess(object = {}) {
        this.emit(Object.assign(object, { type: "result_record", class: "done" }))
        this.emit({ type: 'sequencebreak' })
    }
    finishFailure(object = {}) {
        this.emit(Object.assign(object, { type: "result_record", class: "error" }))
        this.emit({ type: 'sequencebreak' })
    }
    /**
     * 
     * @param object List of Object to be emiited.If array, a sequence break is automatically inserted
     */
    emit(object: Array<any> | Object) {
        if (object instanceof Array) {
            object.forEach(o => this.emit(o))
            this.finishSuccess()
        }
        else if (!("type" in object)) throw "plugin is allowed to emit only those objects which have a type property defined"
        else this.target.emit(object)
    }
}
