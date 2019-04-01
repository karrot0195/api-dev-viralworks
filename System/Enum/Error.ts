export enum RBACErrorMessage {
    PATH_NOT_FOUND = "Path isn't existed",
    PARENT_NOT_FOUND = "Parent role isn't existed",
    USER_NOT_FOUND = "User isn't existed",
    ROLE_NOT_FOUND = "Role isn't existed"
}

export enum CommonErrorMessage {
    E401 = 'Failed authorization',
    E403 = "Don't have permission",
    E404 = 'Not found',
    E405 = '',
    E500 = 'Internal Error',
    E700 = 'Some key are duplicated'
}
