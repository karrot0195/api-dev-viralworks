import { Injectable } from "System/Injectable";
import { BaseModel } from "System/BaseModel";
import { IPermission } from "System/Interface/RBAC";
import { Permission } from "../Schema/PermissionSchema";
import { Mongo } from "System/Mongo";

@Injectable
export class PermissionModel extends BaseModel<IPermission, Permission> {
    constructor(_mongo: Mongo) {
        super(_mongo, 'permission');
    }
}