import * as http from 'http';

import express = require('express');
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as swaggerUi from 'custom_modules/swagger-ui-express';
import { Request, Response, NextFunction } from 'express';

import { Injectable } from './Injectable';
import { Router } from './Router';
import { RoleBasedAccessControl as RBAC } from './RBAC';
import { Swagger } from './Swagger';
import { Security } from './Security';
import { Config } from './Config';
import { BaseError, NotFound, MethodNotAllowed } from './Error';
import { log } from 'Helpers/Log';

import { Mongo } from './Mongo';
import { InitDatabase } from 'Database';
import { MorganFormat } from './Enum/Morgan';
import { CommonErrorMessage } from './Enum/Error';

var debug = require('debug')('shopback-test:server');

@Injectable
export class Application {
    private _app = express();
    private _server = http.createServer(this._app);
    private _publicHost: string;
    private _publicPort: number;
    private _host: string;
    private _port: number;
    private _scheme: string;
    private _docPath: string;

    constructor(
        private readonly _config: Config,
        private readonly _mongo: Mongo,
        private readonly _database: InitDatabase,
        private readonly _router: Router,
        private readonly _rbac: RBAC,
        private readonly _swagger: Swagger,
        private readonly _security: Security
    ) {
        this._publicHost = this._config.server.public.host;
        this._publicPort = this._config.server.public.port;
        this._host = this._config.server.host;
        this._port = this._config.server.port;
        this._scheme = this._config.server.scheme;
        this._docPath = this._config.document.path;
    }

    public async start() {
        log('------------------INITIALIZE-------------------');
        await this._configExpress();
        this._startServer();

        log('-----------------------------------------------');
        log(
            `Server has been running on: ${this._scheme}://${this._publicHost}:${this._publicPort}/${
                this._config.version
            }`
        );

        if (this._config.document.enable) {
            log(
                `Document has been running on: ${this._scheme}://${this._publicHost}:${this._publicPort}/${
                    this._config.version
                }/${this._docPath}`
            );
        }

        log('');
        log('--------------------PROCESS--------------------');
        log('Waiting for log...');
    }

    private async _configExpress() {
        log('Configuring ExpressJS...');
        // Config Logger
        const morganFormat = this._config.env == 'dev' ? MorganFormat.dev : MorganFormat.full;
        this._app.use(
            morgan(morganFormat, {
                skip: function(req, res) {
                    return res.statusCode < 300;
                }
            })
        );
        this._app.use(bodyParser.json());
        this._app.use(bodyParser.urlencoded({ extended: false }));

        // Config CORS
        this._app.use((req: Request, res: Response, next: NextFunction) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });

        // Set JWT
        this._app.use(this._security.decodeToken.bind(this._security));

        // Set Role Base Access Control
        if (this._config.security.RBAC) {
            await this._rbac.load();
        }

        // Router config
        this._app.use(`/${this._config.version}`, this._router.expressRouter);

        // Swagger Document URL
        if (this._config.document.enable) {
            this._app.use(
                `/${this._config.version}/${this._docPath}`,
                swaggerUi.serve,
                swaggerUi.setup(null, this._swagger.opts)
            );
        }

        // Config Not Found
        this._app.use((req: Request, res: Response, next: NextFunction) => {
            const err = new NotFound();
            next(err);
        });

        // Error Handler
        this._app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            if (err instanceof MethodNotAllowed) {
                res.status(err.status).send();
            } else if (err instanceof BaseError) {
                res.status(err.status).json({ code: err.status, error: err.message });
            } else {
                res.status(500).json({ error: CommonErrorMessage.E500 });
                log(err);
            }
        });
        log('Configuring ExpressJS - DONE');
    }

    private _startServer() {
        log('Starting Server...');
        this._server.listen(this._port, this._host);
        this._server.on('listening', this._serverListening.bind(this));
        this._server.on('error', this._serverListenError.bind(this));
        log('Starting Server - DONE');
    }

    private _serverListenError(error: any) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        const bind = typeof this._port === 'string' ? 'Pipe ' + this._port : 'Port ' + this._port;

        // Handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    private _serverListening() {
        var addr = this._server.address();
        var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }
}
