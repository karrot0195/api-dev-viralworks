import { IErrorMessage } from './template';

export const vi: IErrorMessage = {
    USER_IS_DISABLED: 'Tài khoản đã bị khóa. Liên hệ admin@viralworks.com để biết thêm chi tiết.',
    USER_NOT_FOUND: 'Không tìm thấy user.',
    ROLES_NOT_FOUND: 'Danh sách role không hợp lệ.',
    IMAGE_WRONG_TYPE: 'Sai định dạng ảnh.',
    TEMP_AVATAR_NOT_FOUND: 'Không tìm thấy ảnh upload tạm.',
    WRONG_PASSWORD: 'Sai mật khẩu.',
    BRAND_IS_DISABLED: 'Tài khoản brand đã bị khóa.',
    BRAND_NOT_FOUND: 'Không tìm thấy tài khoản Brand.',
    // BRAND_ROLE_NOT_FOUND: 'Không tìm thấy role Brand trong CSDL.',
    RESET_PASSWORD_TOKEN_INVALID: 'Token không tồn tại',
    PATH_NOT_FOUND: 'Không tìm thấy đường dẫn.',
    PARENT_NOT_FOUND: 'Không tìm thấy parent id.',
    ROLE_NOT_FOUND: 'Không tìm thấy role.',
    PERMISSION_NOT_FOUND: 'Không tìm thấy permission.',

    TEMP_PACKAGE_COVER_NOT_FOUND: 'Không tìm thấy cover upload tạm',
    PACKAGE_NOT_FOUND: 'Không tìm thấy public package',
    GROUP_TAG_DUPLLICATED: 'Group tag đã tồn tại.',
    GROUP_TAG_NOT_FOUND: 'Group tag không tồn tại',
    KOLS_NOT_FOUND: 'Danh sách kol không đúng',
    OCCUPATIONS_NOT_FOUND: 'Danh sách nghề nghiệp không đúng',
    TOPICS_NOT_FOUND: 'Danh sách topic không đúng',
    SLUG_DUPLICATED: 'Slug đã tồn tại',

    UNAUTHORIZED: 'Thông tin đăng nhập không chính xác. Vui lòng đăng nhập trước khi sử dụng tình năng này.',
    UNAUTHORIZED_LOGIN: 'Đăng nhập không thành công.',
    UNAUTHORIZED_EXPIRED: 'Thông tin đăng nhập quá hạn. Xin vui lòng đăng nhập lại',
    FORBIDDEN: 'Không đủ quyền thực hiện hành động này.',
    NOT_FOUND: 'Nội dung không tìm thấy.',
    INTERNAL_ERROR: 'Lỗi hệ thống. Liên hệ support@viralworks.com .',
    DUPLICATED: ' bị trùng lặp',

    EMAIL_DUPLICATED: 'Email bị trùng lặp',
    NAME_DUPLICATED: 'Tên bị trùng lặp',

    'pattern mismatch': 'sai định dạng',
    'is required': 'bắt buộc',
    'is the wrong type': 'sai loại',
    'must be an enum value': 'Phải là một giá trị enum',

    // KOL USER
    KOL_USER_NOT_FOUND: 'Không tìm thấy kol user.',
    EMAIL_FIELD_NOT_FOUND: 'Trường email không tồn tại.',
    KOL_EXIST: 'Kol user đã tồn tại.',
    INVITE_NOT_FOND: 'Không tìm thấy lời mời',
    NOT_PERMISSION_TO_INVITE: 'Không đủ quyền để chấp nhận lời mời',
    ANSWER_NOT_CORRECT: 'câu trả lời không đúng',
    TIME_EMPTY: 'Mốc thời gian đã hết chổ',
    TIME_NOT_FOUND: 'Mốc thời gian đã hết chổ',

    // REASON
    REASON_NOT_FOUND: 'Lí do không tồn tại.',
    CAT_REASON_NOT_FOUND: 'Không tìm thấy mục lí do.',

    // FAQ
    FAQ_NOT_FOUND: 'Câu hỏi không tồn tại.',

    //JOB
    JOB_NOT_FOUND: 'Công việc không tồn tại.',
    ATTCHMENT_NOT_FOUND: 'File đính kèm không tồn tại.',
    JOB_PRICE_NOT_FOUND: 'Giá của công việc không tồn tại.',
    LINK_JOB_NOT_FOUND: 'Đường dẫn công việc không tồn tại.',
    ATTACHMENT_WRONG_TYPE: 'Loại file không hợp lệ',
    GROUP_NOT_FOUND: 'Group không tồn tại',
    GROUP_EXIST: 'Group đã tôn tại',

    // KOL JOB
    KOL_JOB_NOT_FOUND: 'Công việc của kol không tồn tại',
    JOB_POST_ACTION_NOT_ALLOW: 'Hành động không được phép với trạng thái công việc hiện tại.',
    STATE_NOT_ALLOW: 'Trạng thái không được phép',
    STATE_NOT_FOUND: 'Trạng thái không được tìm thấy',
    CAUSER_FIELD_NOT_FOUND: 'Trường causer không được tìm thấy',
    SUBJECT_FIELD_NOT_FOUND: 'Trường subject không được tìm thấy',
    JOB_RUNNING: 'Job đang chạy',
    REASON_FIELD_REQUIRED: 'Trường lí do là bắt buộc',
    KOL_JOB_ENABLE_WITH_ACTIVE: 'Công việc chỉ khả dụng với trạng thái ``active``',
    JOB_CHEAT: 'Công việc đã bị đánh giá gian lận',
    JOB_ENABLE_WITH_CLOSE: ' Công việc chỉ khả dụng với trạng thái ``close``',
    SAMPLE_POST_NOT_FOUND: 'Sample post không được tìm thấy',
    COVER_IMAGE_NOT_FOUND: 'Cover image không được tìm thấy',

    // JOB INVITE
    JOB_INVITE_NOT_FOUND: 'Lời mời công việc không tồn tại',
    JOB_INVITE_STATUS_NOT_RAW: 'Lời mời chỉ khả dụng với trạng thái raw',
    KOL_INVITE_EMPTY: 'Kol rỗng',
    ENABLE_WITH_RAW_STATUS: 'Hoạt động với trạng thái raw',
    ENABLE_WITH_REJECT_STATUS: 'Hoạt động với trạng thái reject',

    // MAIL
    MAIL_STATUS_ERROR: 'Trạng thái mail lỗi',
    REINVITE_ERROR: 'Gặp lỗi trong qua trình gửi lại lời mời',

    // SOCIAL
    USER_AGENT_REQUIRED: 'User agent là bắt buộc',
    ERROR_TAKE_CODE_USER: 'Gặp lỗ trong quá trình lấy User Code',
    ERROR_CALLBACK_FB: 'Error when callback',
    TOKEN_NOT_EXISTS: 'phiên bản làm việc hết hạn',
    ERROR_CREATE_KOL: 'Lỗi trong quá trình tạo kol user',
    CODE_NOT_ALLOW: 'Code không được phép',
    ACCESS_TOKEN_NOT_ALLOW: 'Access token Code không được phép',

    ACTION_NOT_ALLOW: 'Hành động không được phép',
    ENTITY_ID_FIELD_NOT_FOUND: 'trường entity_id không tồn tại',
    FEATURE_NOT_ENABLE: 'Tính năng không được phép trên môi trường hiện tại',
    SAVE_ERROR: 'Gặp lỗi trong quá trình lưu trữ dữ liệu',
    PASSWORD_NOT_MATCH: 'mật khẩu không trùng khớp',
    TOKEN_EXPIRED: 'Phiên làm việc đã hết hạn',
    INVITE_ID_REQUIRED: 'invite id là bắt buộc',
    EXISTS_KOL_JOB_NOT_CLOSE: 'tồn tại công việc chưa hoàn thành',
    KOL_GROUP_NOT_EMPTY: 'Nhóm chỉ được xóa khi không tồn tại kol',
    KOL_EMAIL_VERIFY: 'Email đã được xác nhận',
    // Cron
    CRON_NOT_FOUND: 'Không tìm thấy cronjob',
    CRON_ACTION_NOT_FOUND: 'Action không tìm thấy',
};
