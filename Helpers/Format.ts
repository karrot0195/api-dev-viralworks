import { Request } from 'express';

export function parseQueryData(req: Request): any {
    let condition: any = {};
    condition.options = {};
    condition.search = {};

    if (req.query.sort && req.query.order) {
        let order = 1;
        if (req.query.order == 'desc') order = -1;

        let sort = {};
        sort[req.query.sort] = order;

        condition.options.sort = sort;
    }

    if (req.query.limit !== null && req.query.limit !== '') {
        if (req.query.page !== null && req.query.page !== '') condition.options.skip = req.query.page * req.query.limit;

        condition.options.limit = req.query.limit;

        condition.options.page = req.query.page | 0;
    }

    if (req.query.term) {
        condition.search.$text = { $search: req.query.term };
    }

    return condition;
}
