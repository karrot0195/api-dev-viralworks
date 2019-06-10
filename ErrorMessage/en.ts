import { IErrorMessage } from './template';

export const en: IErrorMessage = {
    USER_IS_DISABLED: 'Your account is disabled. Please contact admin@viralworks.com for further information.',
    USER_NOT_FOUND: 'User account does not existed.',
    ROLES_NOT_FOUND: 'Role list contains invalid role.',
    IMAGE_WRONG_TYPE: 'Image provided is not a PNG, JPEG or GIF image.',
    TEMP_AVATAR_NOT_FOUND: 'Temporary avatar provided does not existed',
    WRONG_PASSWORD: 'Password provided is not matched.',
    BRAND_IS_DISABLED: 'Your brand account is disabled. Please contact support@viralworks.com for further information.',
    BRAND_NOT_FOUND: 'Brand account does not existed.',
    // BRAND_ROLE_NOT_FOUND: 'Brand role does not existed.',
    RESET_PASSWORD_TOKEN_INVALID: 'Reset password token is invalid',
    PATH_NOT_FOUND: 'Path provided does not existed. ',
    PARENT_NOT_FOUND: 'Parent role provided does not existed.',
    ROLE_NOT_FOUND: 'Role provided does not existed.',
    PERMISSION_NOT_FOUND: 'Permission provided does not existed.',

    TEMP_PACKAGE_COVER_NOT_FOUND: 'Temporary cover provided does not existed',
    PACKAGE_NOT_FOUND: 'Public package provide does not existed.',
    GROUP_TAG_DUPLLICATED: 'Group tag is duplicated',
    GROUP_TAG_NOT_FOUND: 'Group tag provided is not existed',
    KOLS_NOT_FOUND: 'KOL list provided contains invalid id',
    OCCUPATIONS_NOT_FOUND: 'Occupation list provided contains invalid id',
    TOPICS_NOT_FOUND: 'Topic list provided contains invalid id',
    SLUG_DUPLICATED: 'Slug is duplicated.',

    UNAUTHORIZED: 'Login information provided is invalid. You must login before this action.',
    UNAUTHORIZED_LOGIN: 'Login attemp is failed. Re-check email and password then try again.',
    UNAUTHORIZED_EXPIRED: 'Login information is expired. Please login again',
    FORBIDDEN:
        'You do not have permission to do this action. Please contact admin@viralworks.com for further information.',
    NOT_FOUND: 'Requested content is not found.',
    INTERNAL_ERROR: 'Internal error. Contact server administrator for further information.',
    DUPLICATED: ' is duplicated',

    EMAIL_DUPLICATED: 'Email is duplicated',
    NAME_DUPLICATED: 'Name is duplicated',

    'pattern mismatch': 'pattern mismatch',
    'is required': 'is required',
    'is the wrong type': 'is the wrong type',
    'must be an enum value': 'must be an enum value',

    // KOL USER
    KOL_USER_NOT_FOUND: 'Kol user does not found.',
    EMAIL_FIELD_NOT_FOUND: 'Email field does not exist',
    KOL_EXIST: 'Kol user was existed',
    INVITE_NOT_FOND: 'Not found invite',
    NOT_PERMISSION_TO_INVITE: 'Not permission to accept invite',

    // REASON
    REASON_NOT_FOUND: 'Reason does not exist',
    CAT_REASON_NOT_FOUND: 'Category reason does not exist',

    // FAQ
    FAQ_NOT_FOUND: 'Faq does not exist',

    //JOB
    JOB_NOT_FOUND: 'Job does not exist',
    ATTCHMENT_NOT_FOUND: 'Attachment not exist',
    JOB_PRICE_NOT_FOUND: 'Price does not exist',
    LINK_JOB_NOT_FOUND: 'Link job does not exist',
    ATTACHMENT_WRONG_TYPE: 'Attachment does wrong type',
    GROUP_NOT_FOUND: 'Group does not exist',
    GROUP_EXIST: 'Group was existed',

    // KOL JOB
    KOL_JOB_NOT_FOUND: 'Kol job does not exist',
    JOB_POST_ACTION_NOT_ALLOW: 'Action not allow with current status',
    STATE_NOT_ALLOW: 'State not allow',
    STATE_NOT_FOUND: 'State does not found',
    CAUSER_FIELD_NOT_FOUND: 'Causer field does not found',
    SUBJECT_FIELD_NOT_FOUND: 'Subject field does not found',
    JOB_RUNNING: 'Job running',
    REASON_FIELD_REQUIRED: 'Reason was required',
    KOL_JOB_ENABLE_WITH_ACTIVE: 'Job enable with active status',
    JOB_CHEAT: 'Job was cheat',
    JOB_ENABLE_WITH_CLOSE: ' Job enable with close status',
    SAMPLE_POST_NOT_FOUND: 'Sample post does not exist',
    COVER_IMAGE_NOT_FOUND: 'Cover image does not exist',
    ANSWER_NOT_CORRECT: 'Answers not correct',
    TIME_EMPTY: 'Time empty',
    TIME_NOT_FOUND: 'Not found time',

    // JOB INVITE
    JOB_INVITE_NOT_FOUND: 'Invite for kol does not exist',
    JOB_INVITE_STATUS_NOT_RAW: 'Invite only enable with raw status',
    KOL_INVITE_EMPTY: 'Kol invite does empty',
    ENABLE_WITH_RAW_STATUS: 'enable with raw status',
    ENABLE_WITH_REJECT_STATUS: 'enable with reject status',

    // MAIL
    MAIL_STATUS_ERROR: 'Mail status does error',
    REINVITE_ERROR: 'Error when reinvite',

    // SOCIAL
    USER_AGENT_REQUIRED: 'User agent is required',
    ERROR_TAKE_CODE_USER: 'Error when take code user',
    ERROR_CALLBACK_FB: 'Error when callback',
    TOKEN_NOT_EXISTS: 'Token does not exists',
    ERROR_CREATE_KOL: 'Error while create kol user',
    CODE_NOT_ALLOW: 'Code not allow',
    ACCESS_TOKEN_NOT_ALLOW: 'Access token not allow',

    ACTION_NOT_ALLOW: 'Action not allow',
    ENTITY_ID_FIELD_NOT_FOUND: 'Entity id field not exist',
    FEATURE_NOT_ENABLE: 'Feature not enable in env',
    SAVE_ERROR: 'Error when save data',
    PASSWORD_NOT_MATCH: 'Password does not match',
    TOKEN_EXPIRED: 'Token was expired',
    INVITE_ID_REQUIRED: 'Invite id was required',
    EXISTS_KOL_JOB_NOT_CLOSE: 'Exists job not close',

    // Cron
    CRON_NOT_FOUND: 'Cron job is not found',
    CRON_ACTION_NOT_FOUND: 'Unknown action. Available: enable, disable',
    
    KOL_GROUP_NOT_EMPTY: 'Remove group when kol in group empty',
    KOL_EMAIL_VERIFY: 'Email was verified'
};
