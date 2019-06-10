import { Injectable } from 'System/Injectable';
import { Config } from 'System/Config';
import { en } from './en';
import { vi } from './vi';

require('System/Helpers/Log');

@Injectable
export class ErrorMessage {
    constructor(private readonly _config: Config) {}

    private lang = {
        en: en,
        vi: vi
    };

    get(message: string, locale: string) {
        if (!this.lang[locale]) locale = this._config.lang;

        locale = locale.substring(0, 2);

        if (this._config.env === 'dev') console.log('Err: ' + message);

        return this.lang[locale][message] || this.lang[locale]['INTERNAL_ERROR'];
    }
}
