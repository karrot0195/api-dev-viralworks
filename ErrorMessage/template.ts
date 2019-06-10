export interface IErrorMessage {
    USER_IS_DISABLED: string;
    USER_NOT_FOUND: string;
    ROLES_NOT_FOUND: string;
    IMAGE_WRONG_TYPE: string;
    TEMP_AVATAR_NOT_FOUND: string;
    WRONG_PASSWORD: string;
    BRAND_IS_DISABLED: string;
    BRAND_NOT_FOUND: string;
    // BRAND_ROLE_NOT_FOUND: string;
    RESET_PASSWORD_TOKEN_INVALID: string;
    PATH_NOT_FOUND: string;
    PARENT_NOT_FOUND: string;
    ROLE_NOT_FOUND: string;
    PERMISSION_NOT_FOUND: string;

    TEMP_PACKAGE_COVER_NOT_FOUND: string;
    PACKAGE_NOT_FOUND: string;
    GROUP_TAG_DUPLLICATED: string;
    GROUP_TAG_NOT_FOUND: string;
    KOLS_NOT_FOUND: string;
    OCCUPATIONS_NOT_FOUND: string;
    TOPICS_NOT_FOUND: string;
    SLUG_DUPLICATED: string;

    // Common
    UNAUTHORIZED: string;
    UNAUTHORIZED_LOGIN: string;
    UNAUTHORIZED_EXPIRED: string;
    FORBIDDEN: string;
    NOT_FOUND: string;
    INTERNAL_ERROR: string;
    DUPLICATED: string;

    // Mongo
    EMAIL_DUPLICATED: string;
    NAME_DUPLICATED: string;

    // Swagger
    'pattern mismatch': string;
    'is required': string;
    'is the wrong type': string;
    'must be an enum value': string;

    // KOL USER
    KOL_USER_NOT_FOUND: string;
    EMAIL_FIELD_NOT_FOUND: string;
    KOL_EXIST: string;
    INVITE_NOT_FOND: string;
    NOT_PERMISSION_TO_INVITE: string;
    ANSWER_NOT_CORRECT: string;
    TIME_NOT_FOUND: string;
    TIME_EMPTY: string;

    // REASON
    REASON_NOT_FOUND: string;
    CAT_REASON_NOT_FOUND: string;

    // FAQ
    FAQ_NOT_FOUND: string;

    // JOB
    JOB_NOT_FOUND: string;
    ATTCHMENT_NOT_FOUND: string;
    JOB_PRICE_NOT_FOUND: string;
    LINK_JOB_NOT_FOUND: string;
    ATTACHMENT_WRONG_TYPE: string;
    GROUP_NOT_FOUND: string;
    GROUP_EXIST: string;
    SAMPLE_POST_NOT_FOUND: string;
    COVER_IMAGE_NOT_FOUND: string;

    // KOL JOB
    KOL_JOB_NOT_FOUND: string;
    STATE_NOT_ALLOW: string;
    JOB_POST_ACTION_NOT_ALLOW: string;
    CAUSER_FIELD_NOT_FOUND: string;
    SUBJECT_FIELD_NOT_FOUND: string;
    STATE_NOT_FOUND: string;
    JOB_RUNNING: string;
    REASON_FIELD_REQUIRED: string;
    KOL_JOB_ENABLE_WITH_ACTIVE: string;
    JOB_CHEAT: string;
    JOB_ENABLE_WITH_CLOSE: string;

    // JOB INVITE
    JOB_INVITE_NOT_FOUND: string;
    JOB_INVITE_STATUS_NOT_RAW: string;
    KOL_INVITE_EMPTY: string;
    ENABLE_WITH_RAW_STATUS: string;
    ENABLE_WITH_REJECT_STATUS: string;

    // MAIL
    MAIL_STATUS_ERROR: string;
    REINVITE_ERROR: string;

    // SOCIAL
    USER_AGENT_REQUIRED: string;
    ERROR_TAKE_CODE_USER: string;
    ERROR_CALLBACK_FB: string;
    ERROR_CREATE_KOL: string;
    TOKEN_NOT_EXISTS: string;
    CODE_NOT_ALLOW: string;
    ACCESS_TOKEN_NOT_ALLOW: string;

    ACTION_NOT_ALLOW: string;
    ENTITY_ID_FIELD_NOT_FOUND: string;
    FEATURE_NOT_ENABLE: string;
    SAVE_ERROR: string;
    PASSWORD_NOT_MATCH: string;
    TOKEN_EXPIRED: string;
    INVITE_ID_REQUIRED: string;

    EXISTS_KOL_JOB_NOT_CLOSE: string;

    // CRON
    CRON_NOT_FOUND: string;
    CRON_ACTION_NOT_FOUND: string;
    
    KOL_GROUP_NOT_EMPTY: string;
    KOL_EMAIL_VERIFY: string;
}
