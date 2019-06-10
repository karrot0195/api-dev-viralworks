import {ICommand} from "System/Interface/Command";
import {Injectable} from "System/Injectable";
import {Mongo} from "System/Mongo";
import {KolManagerService} from "App/Modules/Kol/Services/Admin/KolManagerService";
import {KolUser} from "Database/Schema/KolUserSchema";

@Injectable
export class KolCommand implements ICommand {
    constructor(private _mongo: Mongo, private _kolAuthService: KolManagerService) {}

    run = async (data: Array<string>) => {
        const params = this.takeParams(data);
        switch (params['action']) {
            case 'remove-kol':
                const kol = <KolUser>(await this._kolAuthService.findByEmail(params['email']));
                if (kol) {
                    await kol.remove();
                }
        }
    };

    takeParams = (dataString: Array<string>) => {
        let data: object = {};
        dataString.forEach(v => {
            let arr = v.split('=');
            if (arr.length >= 2) {
                data[arr[0]] = arr[1];
            }
        });
        return data;
    };
}