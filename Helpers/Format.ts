import { Request } from 'express';

export function buildCondition(req: Request): any {
    let condition: any = {};

    if (req.query.sort && req.query.order) {
        let order = 1;
        if (req.query.order == 'desc') order = -1;
        let sort = {};
        sort[req.query.sort] = order;

        condition.sort = sort;
    }

    if (req.query.limit && req.query.page) {
        condition.limit = req.query.limit;
        condition.skip = req.query.page * req.query.limit;
    }

    if (req.query.term) {
        condition.$text = { $search: '"' + req.query.term + '"' };
    }

    return condition;
}
