import { HTTP } from 'System/Enum/HTTP';
import { Injectable } from 'System/Injectable';
import { ICommand } from 'System/Interface';
import { UserService } from 'App/Modules/Admin/Services/UserService';

@Injectable
export class CreateUser implements ICommand {
    constructor(private readonly service: UserService) { }

    public async run() {
        const user = await this.service.create({
            name: 'Daniel',
            email: 'truong.huynh@viralworks.com',
            password: 'daniel123!@#',
            role: 'admin'
        });

        // const user = await this.service.findById('5c91241273086216cc06c70e');
        
        // if (user) {
        //     user.name = 'Admin';
        //     await user.save();
        // }

        return user;
    }
}