export enum USER_STATUS {
    ACTIVE = 'ACTIVE',
    DISABLED = 'DISABLED',
}

export enum USER_ROLE {
    ADMIN = 1,
    USER = 2,
}

export enum SCHEDULE_TYPE {
    CRON = 'cron',
    TIMEOUT = 'timeout',
    INTERVAL = 'interval',
}

export enum MEDIA_TYPE {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    AUDIO = 'AUDIO',
    DOCUMENT = 'DOCUMENT',
    MISC = 'MISC',
}

export enum NOTIFICATION_TYPE {
    NEW_TASK = 'NEW_TASK',
    NEW_LEAVE_REQUEST = 'NEW_LEAVE_REQUEST',
    NEW_CLAIM = 'NEW_CLAIM',
    WORK_SOLVING_STATUS = 'WORK_SOLVING_STATUS',
    APPLICATION_RESOLUTION_STATUS = 'APPLICATION_RESOLUTION_STATUS',
    EXPIRED_PASSPORT = 'EXPIRED_PASSPORT',
}

export enum CACHE_TIME {
    ONE_MINUTE = 60,
    THIRTY_MINUTES = 1800,
    ONE_HOUR = 3600,
    ONE_DAY = 86400,
    ONE_WEEK = 604800,
    ONE_MONTH = 2592000,
    ONE_YEAR = 31536000,
}

export enum INVENTORY_HISTORY_TYPE {
    IMPORT = 'IMPORT',
    EXPORT = 'EXPORT',
    STOCKTAKE = 'STOCKTAKE',
}

export enum PROPOSAL_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export enum PROPOSAL_TYPE {
    // PURCHASE = 'PURCHASE',
    SUPPLY = 'SUPPLY',
    // REPAIR = 'REPAIR',
    // ADJUSTMENT = 'ADJUSTMENT',
    // TRANSFER = 'TRANSFER',
    // STOCKING = 'STOCKING',
    // REPLENISHMENT = 'REPLENISHMENT',
}

export enum PROPOSAL_TYPE_NAME {
    PURCHASE = 'Yêu cầu mua hàng',
    SUPPLY = 'Yêu cầu cấp vật tư',
    // REPAIR = 'Yêu cầu sửa chữa',
}

export enum WAREHOUSING_BILL_TYPE {
    IMPORT = 'IMPORT',
    EXPORT = 'EXPORT',
    // ADJUSTMENT = 'ADJUSTMENT',
    // TRANSFER = 'TRANSFER',
    // STOCKING = 'STOCKING',
    // REPLENISHMENT = 'REPLENISHMENT',
}

export enum WAREHOUSING_BILL_TYPE_NAME {
    IMPORT = 'Phiếu nhập kho',
    EXPORT = 'Phiếu xuất kho (sửa chữa)',
}

export enum WAREHOUSING_BILL_STATUS {
    PENDING = 'PENDING',
    // APPROVED = 'APPROVED',
    // REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export enum STOCKTAKE_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    STOCKTAKING = 'STOCKTAKING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    FINISHED = 'FINISHED',
    COMPLETED = 'COMPLETED',
}

export enum ORDER_TYPE {
    PURCHASE = 'PURCHASE',
    // SALE = 'SALE',
}

export enum ORDER_TYPE_NAME {
    PURCHASE = 'Đơn nhập hàng',
    // SALE = 'Đơn bán hàng',
}

export enum ORDER_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export enum DAMAGE_LEVEL {
    MINOR = 'MINOR',
    MODERATE = 'MODERATE',
    SEVERE = 'SEVERE',
}

export enum DAMAGE_LEVEL_NAME {
    MINOR = 'Nhẹ',
    MODERATE = 'Trung bình',
    SEVERE = 'Nặng',
}

export enum REPAIR_REQUEST_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    EXPORTED = 'EXPORTED',
    COMPLETED = 'COMPLETED',
}

export enum HUMAN_DASHBOARD_TYPE {
    SEX = 'SEX',
    SENIORITY = 'SENIORITY',
    BY_MONTH = 'BY_MONTH',
}

export enum CALENDAR_TYPE {
    BY_MONTH = 'BY_MONTH',
    BY_WEEK = 'BY_WEEK',
    BY_DAY = 'BY_DAY',
    // ----
}

export enum CONTRACT_STATUS {
    ACTIVE = 1,
    INACTIVE = 0,
}

export enum CONTRACT_TYPE {
    GENERAL = 1,
    // ----
}

export enum HOLIDAY_TYPE {
    TET = 'TET',
    // ----
}

export enum CONTRACT_RESULT {
    GENERAL = 1,
    // ----
}

export enum LEAVE_APPLICATION_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export enum LEAVING_LATE_EARLY_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export enum FORGOT_CHECKIN_OUT_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export enum SHIFT_TYPE {
    TIME_RANGE = 1,
    HOUR_BASED = 0,
}

export enum RESIGNATION_STATUS {
    PENDING = 1,
    // ----
}

export enum EMPLOYEE_LEAVE_REQUEST_STATUS {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    CLOSED = 'CLOSED',
    // ----
}

export enum FORGOTTEN_TIMEKEEPING_REQUEST_STATUS {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    CLOSED = 'CLOSED',
    // ----
}

export enum OVERTIME_REQUEST_STATUS {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    CLOSED = 'CLOSED',
    // ----
}

export enum TIME_ATTENDANCE_STATUS {
    ACCEPT = 'ACCEPT',
    // ----
}

export enum TASK_PRIORITY {
    HIGH = 1,
    // ----
}

export enum ASSET_STATUS {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum LEVEL_CALENDAR {
    LESS_IMPORTANT = 'LESS_IMPORTANT',
    NORMAL = 'NORMAL',
    IMPORTANT = 'IMPORTANT',
    HIGH_PRIORITY = 'HIGH_PRIORITY',
    // ----
}

export enum IS_MANAGER {
    YES = 1,
    NO = 0,
    // ----
}

export enum PAYMENT_ORDER_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
    // ----
}

export enum REQUEST_ADVANCE_PAYMENT_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
    // ----
}

export enum REQUEST_OVERTIME_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
    // ----
}

export enum RICE_COUPON_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
    // ----
}

export enum FOOD_VOUCHER_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
    // ----
}

export enum RESIGNATION_LETTER_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
    // ----
}

export enum PAYMENT_REQUEST_LIST_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export enum DRIVING_ORDER_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export enum TRAVEL_PAPER_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export enum TRACKING_LOG_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export enum CONFIRM_PORTAL_STATUS {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
}

export enum POSITION {
    NV = 'STAFF',
    TBP = 'HEAD',
    TCHC = 'TCHC',
    KTTT = 'ACCOUNTING_PAYMENT',
    KTT = 'CHIEF_ACCOUNTANT',
    GD = 'MANAGER',
}

export enum TASK_STATUS {
    FINISHED = 'FINISHED',
    UNFINISHED = 'UNFINISHED',
}

export enum APPROVAL_ACTION {
    SUBMIT = 'SUBMIT',
    APPROVE = 'APPROVE',
    REJECT = 'REJECT',
    FORWARD = 'FORWARD',
}
