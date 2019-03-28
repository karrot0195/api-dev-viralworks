export const checkRoutePath = /^((\/[-a-z0-9]+)|(\/{[a-zA-Z_]+}))+$/;
export const checkModuleName = /^[a-z]+$/;
export const getParamsInRoutePath = /{([a-zA-Z]+)}/g;
export const checkMongoId = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;