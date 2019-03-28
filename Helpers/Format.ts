/*
Parsing URL queries to data that can be used in Mongoose

Example: Model.find(conditions, {}, options)

Code above will find value match conditions then paginate and sort using options
*/
export function processQuery(query: any, fields: Array<string>): any {
    const result: any = {};
    result.options = {};
    result.conditions = {};
    if (typeof query == 'object') {
        result.options.page = query.page || 0;
        result.options.limit = query.limit || 0;
        result.options.skip = result.options.page * result.options.limit;
        result.options.sort = processSort(query.sort);
        result.conditions = processValue(query.value, query.term, fields);
    }

    return result;
}

function processValue(value: any, term: any, fields: Array<string>) {
    let result: any = {};

    if (term && fields) {
        result.$or = [];
        fields.forEach(item => {
            let tmp: any = {};
            tmp[item] = { $regex: term, $options: 'i' };
            result.$or.push(tmp);
        });
    }

    if (value) {
        value.split(',').map(item => {
            let tmp = item.split('|');
            if (result[tmp[0]] === undefined) result[tmp[0]] = {};
            if (result[tmp[0]].$in === undefined) result[tmp[0]].$in = [];
            result[tmp[0]].$in.push(tmp[1]);
        });
    }
    return result;
}

function processSort(sort: any) {
    if (sort) {
        let result = {};
        sort.split(',').map(item => {
            let tmp = item.split('|');
            result[tmp[0]] = 1;
            if (tmp[1] == 'desc') result[tmp[0]] = -1;
        });
        return result;
    }
}
