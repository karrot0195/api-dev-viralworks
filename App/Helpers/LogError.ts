import * as path from "path";

export class LogError {
    static logs: any;

    static getInstance() {
        if (!LogError.logs) {
            const rfs = require('rotating-file-stream');
            LogError.logs = rfs('errors.log', {
                interval: '1d', // rotate daily
                path: path.join(__dirname, '../../', 'log')
            })
        }
        return LogError.logs;
     }

    static addLog(text: string|string[]) {
        const time = new Date();
        let data = `\n ${time}`;
        if ((typeof text) == 'string') {
            data += `\n\t ${text}`;
        } else if (text && text.length) {
            for (const t of text) {
                data += `\n\t ${t}`;
            }
        }
        return LogError.getInstance().write(data);
    }
}