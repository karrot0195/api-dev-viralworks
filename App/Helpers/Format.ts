export function formatError(err:any, status:number = 500) {
    if (typeof err  == 'string') { 
        return {
            status: status,
            errors: {
                message: err
            }
        };
    } else {
        return {
            status: status,
            errors: err
        };
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