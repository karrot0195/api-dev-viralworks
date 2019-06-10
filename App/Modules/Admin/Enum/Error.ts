export enum JobError {
    JOB_NOT_FOUND = "Job not found",
    ATTACHMENT_WRONG_TYPE = 'Attachment is not an image',
    ATTACHMENT_NOT_FOUND = 'Attchment not found',
    GROUP_EXISTS = 'Group was existed',
    KOL_EXISTS = 'Kol was existed',
    GROUP_NOT_FOUND = 'Group not found',
    JOB_RUNNING = 'Job running',
    KOL_NOT_FOUND = 'Kol not found'
}

export enum JobInvite {
    EMPTY_KOL_INVITE = 'Not Kol waiting invite',
    SEND_MAIL_ERROR = 'Send mail error'
}

export enum KolError {
    KOL_USER_NOT_FOUND = 'Kol is not existed',
    MISS_ENTITY_ID = 'Kol miss enity_id field',
    SAVE_ERROR = 'Error when save data',
    CONFLICT_EMAIL = 'Duplicate Email'
}

export enum KolJobError {
    NOT_FOUND_INVITE = 'Not found request invite',
    NOT_FOUND_PRICE = 'Not found price for job',
    INVITE_STATUS_ERROR = 'Status invite not invalid',
    NOT_FOUND_KOL_JOB = 'Job not exists',
    REASON_FIELD_REQUIRED = 'Miss reason for reject action',
    ACTION_NOT_ALLOW = 'Action not allow with status',
    ACTION_FIELD_ALLOW = 'Action not allow',
    CHEAT_JOB = 'Job was cheated',
    ENABLE_CLOSE_JOB = 'Enable with job closed',
    ENABLE_WITH_ACTIVE = 'Enable with job active'
}
