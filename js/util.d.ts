export declare function escapeCommadArg(str: string): string;
/**
 * Quotes the argument if it does not start with --
 */
export declare function prepareInput(arg: string): string;
export declare function gettoken(): string;
/**
 * scrap token from an mi command, if  none is present add one and return the new token. token is undefined  on commands not starting with -
 * @param command mi command
 */
export declare function getWithoutToken(fullcommand: string): string;
export declare function parseArg(args: string[]): {
    [key: string]: string | boolean;
};
export declare function getoraddtoken(command: string): {
    token: string;
    command: string;
    name: string;
};
//# sourceMappingURL=util.d.ts.map