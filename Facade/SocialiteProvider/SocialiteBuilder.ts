import { Injectable } from 'System/Injectable';
import { IPlugin } from './Interface/IPlugin';
import { FacebookPlugin } from './Plugin/FacebookPlugin';

@Injectable
export class SocialiteBuilder {
    private plugins: Array<IPlugin> = [];
    public plugin: IPlugin;

    constructor() {
        this.registerPlugin(new FacebookPlugin());
    }

    public build(name: string) {
        const plugin = <IPlugin>this.plugins.find(_p => _p.name == name);
        if (plugin) {
            this.plugin = plugin;
            return plugin;
        }
        return false;
    }

    private registerPlugin(p: IPlugin) {
        const plugin = this.plugins.find(_p => _p.name == p.name);
        if (!plugin) {
            this.plugins.push(p);
        }
    }
}
