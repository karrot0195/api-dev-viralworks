export function formatError(err:string, status:number = 500) {
    return {
            status: status,
            errors: err
        };
}

export function formatResult(result:any, status:number = 200) {
    if (typeof result  == 'string') { 
        return {
            status: status,
            results: {
                message: result
            }
        };
    } else {
        return {
            status: status,
            results: result
        };
    };
}