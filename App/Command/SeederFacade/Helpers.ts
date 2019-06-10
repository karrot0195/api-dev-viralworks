import { SeederCommand } from "../SeederCommand";
import { CategoryJobPlugin } from "./Plugin/CategoryJobPlugin";
import { CategoryShareStoryPlugin } from "./Plugin/CategoryShareStoryPlugin";
import { CategoryReasonPlugin } from "./Plugin/CategoryReasonPlugin";
import { BlogPlugin } from "./Plugin/BlogPlugin";
import { FaqPlugin } from "./Plugin/FaqPlugin";
import { SuggestKolPricePlugin } from "./Plugin/SuggestKolPricePlugin";
import { ProvincePlugin } from "./Plugin/ProvincePlugin";
import { KolUserPlugin } from "./Plugin/KolUserPlugin";
import { BankPlugin } from 'App/Command/SeederFacade/Plugin/BankPlugin';

export function registerSeederPlugin() {
    SeederCommand.registerPlugin(new CategoryJobPlugin());
    SeederCommand.registerPlugin(new CategoryShareStoryPlugin());
    SeederCommand.registerPlugin(new CategoryReasonPlugin());
    SeederCommand.registerPlugin(new BlogPlugin());
    SeederCommand.registerPlugin(new FaqPlugin());
    SeederCommand.registerPlugin(new SuggestKolPricePlugin());
    SeederCommand.registerPlugin(new ProvincePlugin());
    SeederCommand.registerPlugin(new BankPlugin());

    // time-consuming
    SeederCommand.registerPlugin(new KolUserPlugin());
}
