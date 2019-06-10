export const crons: ICron = {
    'update-kol-facebook-stat': {
        description: 'Update facebook kol stats',
        is_loaded: false,
        interval: '',
        interval_crontab: '0 2 * * *',
        command: 'cd $(pwd) && ./command --run=UpdateFb'
    }
};

interface ICron {
    [name: string]: {
        description: string;
        is_loaded: any;
        interval: string;
        interval_crontab: string;
        command: string;
    };
}
