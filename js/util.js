"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getoraddtoken = exports.getWithoutToken = exports.gettoken = exports.prepareInput = exports.escapeCommadArg = void 0;
function escapeCommadArg(str) {
    return str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}
exports.escapeCommadArg = escapeCommadArg;
/**
 * Quotes the argument if it does not start with --
 */
function prepareInput(arg) {
    arg = escapeCommadArg(arg);
    if (arg.startsWith("--"))
        return arg;
    else
        return `"${arg}"`;
}
exports.prepareInput = prepareInput;
function gettoken() {
    return Math.random().toString().slice(2);
}
exports.gettoken = gettoken;
/**
 * scrap token from an mi command, if  none is present add one and return the new token. token is undefined  on commands not starting with -
 * @param command mi command
 */
function getWithoutToken(fullcommand) {
    var command = fullcommand.match(/^(\d*)-(.*)/)?.map(a => a)[2];
    if (command)
        return command;
    else
        return fullcommand;
}
exports.getWithoutToken = getWithoutToken;
function getoraddtoken(command) {
    var result = command.match(/^(\d*)-(.*)/);
    if (result) {
        var [, token, name] = result;
        if (token == '') {
            var token = gettoken();
            command = token + command;
        }
    }
    else {
        var [, token, name] = [undefined, "", command];
    }
    return { token, command, name };
}
exports.getoraddtoken = getoraddtoken;
//# sourceMappingURL=util.js.map