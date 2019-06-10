import { exec as run } from 'child_process';
import { InternalError } from 'System/Error/InternalError';

export async function isRunning(name: string, cmd: string, interval: string) {
    let command = `crontab -l | grep "${interval.replace(/\*/g, '\\*')} ${cmd} \>\> $(pwd)/log/cron.${name}.log"`;

    console.log('RUN:', command);

    return new Promise((resolve, rejects) => {
        run(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                resolve(false);
            }

            console.log(`stderr: ${stderr}`);

            if (stdout.trim() !== '') {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }).catch(() => {
        return false;
    });
}

export async function enableCron(name: string, cmd: string, interval: string) {
    let command = `((crontab -l | grep -v "${interval.replace(
        /\*/g,
        '\\*'
    )} ${cmd} \>\> $(pwd)/log/cron.${name}.log") ; echo "${interval} ${cmd} \>\> $(pwd)/log/cron.${name}.log") | crontab -`;

    console.log('RUN:', command);

    return new Promise((resolve, rejects) => {
        run(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                rejects();
            }
            console.log(`stderr: ${stderr}`);
            resolve({ enable: 'ok' });
        });
    }).catch(() => {
        throw new InternalError('EXEC_FAILED');
    });
}

export async function disableCron(name: string, cmd: string, interval: string) {
    let command = `(crontab -l | grep -v "${interval.replace(
        /\*/g,
        '\\*'
    )} ${cmd} \>\> $(pwd)/log/cron.${name}.log" ) | crontab -`;

    console.log('RUN:', command);

    return new Promise((resolve, rejects) => {
        run(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                rejects();
            }
            console.log(`stderr: ${stderr}`);
            resolve({ disable: 'ok' });
        });
    }).catch(() => {
        throw new InternalError('EXEC_FAILED');
    });
}
