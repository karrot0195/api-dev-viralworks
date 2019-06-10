import { Injectable } from 'System/Injectable';
import { Config } from 'System/Config';

const Arena = require('bull-arena');

@Injectable
export class QueueUI {
    public arena;

    constructor(private readonly _config: Config) {
        this.arena = Arena(
            {
                queues: [
                    {
                        // Name of the bull queue, this name must match up exactly with what you've defined in bull.
                        name: 'email',

                        // Hostname or queue prefix, you can put whatever you want.
                        hostId: 'MyAwesomeQueues',

                        // Redis auth.
                        redis: {
                            port: this._config.redis.port,
                            host: this._config.redis.host,
                            password: this._config.redis.password
                        }
                    }
                ]
            },
            {
                // Let express handle the listening.
                disableListen: true
            }
        );
    }
}
