import 'reflect-metadata';
require('dotenv').config();

const args = process.argv.slice(2);

if (args == undefined || args.length == 0) {
    console.log(helper());
    process.exit();
}

const moduleName = args.splice(0, 1)[0] || '';

import { register } from 'tsconfig-paths';
const tsConfig = require('./tsconfig.json');

register({
    baseUrl: tsConfig.compilerOptions.baseUrl,
    paths: tsConfig.compilerOptions.paths
});

import { bootstrap } from 'System/Injectable';
import { Application } from 'System/Application';
import { Command } from 'System/Command';
import { Config } from 'System/Config';
import { config } from './config';

if (moduleName == '--service') {
    const app = bootstrap(Application, { provide: Config, useValue: config });

    app.start().catch(error => {
        console.error(error);
        process.exit();
    });
} else if (moduleName == '--command') {
    if (args == undefined || args.length == 0 || args[0] == '--help') {
        console.log(commandHelper());
        process.exit();
    }

    const command = bootstrap(Command, { provide: Config, useValue: config });

    command
        .start(args)
        .then(result => {
            console.log(result);
            process.exit();
        })
        .catch(error => {
            console.error(error);
            process.exit();
        });
} else if (moduleName == '--mail') {
    const command = bootstrap(Command, { provide: Config, useValue: config });

    command.start(['--run=EmailQueue']).catch(error => {
        console.error(error);
    });
}

function helper() {
    return `
Usage: ts-node --files index.ts -- [module]

Modules:
    --service               run Web Service
    --command               run Command module
    --mail                  run Mail Queue
${commandHelper()}`;
}

function commandHelper() {
    return `
Command Module:
Usage: ./command [arguments]

Arguments:
    --ver                   print API Framework version
    --config                print API Framework configuration
    --system=<command_key>  use system feature from API Framework by key
    --run=<command_key>     run defined command by key`;
}
