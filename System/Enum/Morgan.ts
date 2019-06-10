export enum MorganFormat {
    dev = ':date[iso] | :method :url :status :response-time ms - :res[content-length] :err',
    full = ':date[iso] | :remote-addr - :remote-user  ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :err'
}
