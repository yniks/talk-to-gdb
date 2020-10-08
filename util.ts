export function escapeCommadArg(str: string) {
    return str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')
}
/**
 * Quotes the argument if it does not start with --
 */
export function prepareInput(arg: string) {
    arg = escapeCommadArg(arg)
    if (arg.startsWith("--")) return arg
    else return `"${arg}"`
}
export function gettoken(): string {
    return Math.random().toString().slice(2)
}
/**
 * scrap token from an mi command, if  none is present add one and return the new token. token is undefined  on commands not starting with -
 * @param command mi command
 */
export function getWithoutToken(fullcommand: string) {
    var command = fullcommand.match(/^(\d*)-(.*)/)?.map(a => a)[2]
    if (command) return command
    else return fullcommand
}
export function getoraddtoken(command: string) {
    var result = command.match(/^(\d*)-(.*)/)
    if (result) {
        var [, token, name] = result;
        if (token == '') {
            var token = gettoken()
            command = token + command
        }
    }
    else {
        var [, token, name] = [undefined, "", command]
    }
    return { token, command, name }
}