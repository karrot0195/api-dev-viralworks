var log = console.log;

console.log = function(arguments: any[]) {
    log.apply(console, [new Date().toISOString(), '|'].concat(arguments));
};
