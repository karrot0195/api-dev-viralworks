import { Injectable } from "System/Injectable";
import { BaseModel } from "System/BaseModel";
import { IRole } from "System/Interface/RBAC";
import { Role } from "../Schema/RoleSchema";
import { Mongo } from "System/Mongo";

@Injectable
export class RoleModel extends BaseModel<IRole, Role> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'role');
    }
}