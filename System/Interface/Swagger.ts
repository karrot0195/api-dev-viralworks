import { DataType, FormatType, MIME } from 'System/Enum';

export interface IValidation {
    readonly body?: IArrayOfArraySchema | IObjectOfArraySchema;
    readonly query?: {
        [field: string]: IStringSchema | IIntegerSchema | INumberSchema | IQueryArraySchema
    };
    readonly header?: {
        [field: string]: IStringSchema
    };
    readonly path?: {
        [field: string]: IStringSchema | IIntegerSchema | INumberSchema
    };
    readonly formData?: {
        [field: string]: IFileSchema | IStringSchema | IIntegerSchema | INumberSchema | IQueryArraySchema | IBooleanSchema
    }
};

export interface ISchema {
    readonly description?: string;
    readonly title?: string;
    readonly default?: any | any[];
    readonly example?: string;
}

export interface IStringOfArraySchema extends ISchema {
    readonly type: DataType.String;
    readonly format?: FormatType.Binary | FormatType.Byte | FormatType.Date | FormatType.DateTime | FormatType.Password | FormatType.Email;
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly nullable?: boolean;
    readonly pattern?: string;
    readonly enum?: (string | number | boolean)[];
}

export interface IStringSchema extends IStringOfArraySchema {
    readonly required?: boolean;
}

export interface IBooleanOfArraySchema extends ISchema {
    readonly type: DataType.Boolean;
    readonly nullable?: boolean;
    readonly enum?: (string | number | boolean)[];
}

export interface IBooleanSchema extends IBooleanOfArraySchema {
    readonly required?: boolean;
}

export interface IIntegerOfArraySchema extends ISchema {
    readonly type: DataType.Integer;
    readonly format?: FormatType.Int32 | FormatType.Int64
    readonly minimum?: number;
    readonly maximum?: number;
    readonly exclusiveMinimum?: boolean;
    readonly exclusiveMaximum?: boolean;
    readonly nullable?: boolean;
    readonly pattern?: string;
    readonly enum?: (string | number | boolean)[];
}

export interface IIntegerSchema extends IIntegerOfArraySchema {
    readonly required?: boolean;
}

export interface INumberOfArraySchema extends ISchema {
    readonly type: DataType.Number;
    readonly format?: FormatType.Int32 | FormatType.Int64 | FormatType.Float | FormatType.Double
    readonly minimum?: number;
    readonly maximum?: number;
    readonly exclusiveMinimum?: boolean;
    readonly exclusiveMaximum?: boolean;
    readonly nullable?: boolean;
    readonly pattern?: string;
    readonly enum?: (string | number | boolean)[];
}

export interface INumberSchema extends INumberOfArraySchema {
    readonly required?: boolean;
}

export interface IObjectOfArraySchema extends ISchema {
    readonly type: DataType.Object;
    readonly properties: {
        readonly [field: string]: IStringSchema | IIntegerSchema | INumberSchema | IBooleanSchema | IArraySchema | IObjectSchema
    }
}

export interface IObjectSchema extends IObjectOfArraySchema {
    readonly required?: boolean;
}

export interface IArrayOfArraySchema extends ISchema {
    readonly type: DataType.Array;
    readonly items: IStringOfArraySchema | IIntegerOfArraySchema | INumberOfArraySchema | IBooleanOfArraySchema | IArrayOfArraySchema | IObjectOfArraySchema;
    readonly minItems?: number;
    readonly maxItems?: number;
    readonly uniqueItems?: boolean;
}

export interface IArraySchema extends IArrayOfArraySchema {
    readonly required?: boolean;
}

export interface IFileSchema extends ISchema{
    readonly type: DataType.File;
    readonly required?: boolean;
}

export interface IFormDataSchema extends ISchema{
    readonly type: DataType.Object;
    readonly properties : {
        readonly [field: string]: DataType.File;
    }
}

export interface IQueryArraySchema extends IArraySchema {
    readonly collectionFormat?: 'multi' | 'pipes' | 'tsv' | 'ssv' | 'csv';
}

type Description = string;

export interface ISwaggerDocument {
    readonly tags?: string[];
    readonly summary?: string;
    readonly produces?: MIME[];
    readonly security?: boolean;
    readonly responses?: {
        [code: number]: Description;
    }
}