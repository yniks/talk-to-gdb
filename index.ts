import { BasePlugin } from "./BasePlugin";

interface Flavoring<FlavorT> { _type?: FlavorT; }
export type Nominal<T, FlavorT> = T & Flavoring<FlavorT>;

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason)
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
})

export { TalktoGdb } from "./TalktoGdb"
export * from "./util"
export * from "./BasePlugin"