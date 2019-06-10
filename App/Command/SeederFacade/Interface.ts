import { SeederCommand } from "../SeederCommand";

export interface IPluginSeeder {
    name: string;
    description: string;
    excute(context: SeederCommand): Promise<any>;
}