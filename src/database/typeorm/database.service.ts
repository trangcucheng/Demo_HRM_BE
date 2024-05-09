import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CACHE_TIME } from '~/common/enums/enum';
import { AccountRepository } from '~/database/typeorm/repositories/account.repository';
import { ApprovalConfigRepository } from '~/database/typeorm/repositories/approvalConfig.repository';
import { ApprovalProcessRepository } from '~/database/typeorm/repositories/approvalProcess.repository';
import { AssetRepository } from '~/database/typeorm/repositories/asset.repository';
import { CalendarRepository } from '~/database/typeorm/repositories/calendar.repository';
import { ConfirmPortalRepository } from '~/database/typeorm/repositories/confirmPortal.repository';
import { ConfirmPortalDetailRepository } from '~/database/typeorm/repositories/confirmPortalDetail.repository';
import { ContractRepository } from '~/database/typeorm/repositories/contract.repository';
import { DepartmentRepository } from '~/database/typeorm/repositories/department.repository';
import { DrivingOrderRepository } from '~/database/typeorm/repositories/drivingOrder.repository';
import { DrivingOrderDetailRepository } from '~/database/typeorm/repositories/drivingOrderDetail.repository';
import { FreeTimekeepingRepository } from '~/database/typeorm/repositories/freeTimekeeping.repository';
import { HolidayRepository } from '~/database/typeorm/repositories/holiday.repository';
import { InventoryRepository } from '~/database/typeorm/repositories/inventory.repository';
import { InventoryHistoryRepository } from '~/database/typeorm/repositories/inventoryHistory.repository';
import { MediaRepository } from '~/database/typeorm/repositories/media.repository';
import { NotificationRepository } from '~/database/typeorm/repositories/notification.repository';
import { NotificationDetailRepository } from '~/database/typeorm/repositories/notificationDetail.repository';
import { OrderRepository } from '~/database/typeorm/repositories/order.repository';
import { OrderItemRepository } from '~/database/typeorm/repositories/orderItem.repository';
import { OrderProgressTrackingRepository } from '~/database/typeorm/repositories/orderProgressTracking.repository';
import { PaymentOrderRepository } from '~/database/typeorm/repositories/paymentOrder.repository';
import { PaymentRequestDetailRepository } from '~/database/typeorm/repositories/paymentRequestDetail.repository';
import { PaymentRequestListRepository } from '~/database/typeorm/repositories/paymentRequestList.repository';
import { PermissionRepository } from '~/database/typeorm/repositories/permission.repository';
import { PositionRepository } from '~/database/typeorm/repositories/position.repository';
import { PositionGroupRepository } from '~/database/typeorm/repositories/positionGroup.repository';
import { ProductRepository } from '~/database/typeorm/repositories/product.repository';
import { ProductCategoryRepository } from '~/database/typeorm/repositories/productCategory.repository';
import { ProductMetaRepository } from '~/database/typeorm/repositories/productMeta.repository';
import { ProposalRepository } from '~/database/typeorm/repositories/proposal.repository';
import { ProposalDetailRepository } from '~/database/typeorm/repositories/proposalDetail.repository';
import { QuantityLimitRepository } from '~/database/typeorm/repositories/quantityLimit.repository';
import { ReceiptRepository } from '~/database/typeorm/repositories/receipt.repository';
import { RepairDetailRepository } from '~/database/typeorm/repositories/repairDetail.repository';
import { RepairProgressRepository } from '~/database/typeorm/repositories/repairProgress.repository';
import { RepairRequestRepository } from '~/database/typeorm/repositories/repairRequest.repository';
import { RequestAdvancePaymentRepository } from '~/database/typeorm/repositories/requestAdvancePayment.repository';
import { RequestAdvancePaymentDetailRepository } from '~/database/typeorm/repositories/requestAdvancePaymentDetail.repository';
import { RequestOvertimeRepository } from '~/database/typeorm/repositories/requestOvertime.repository';
import { RequestOvertimeDetailRepository } from '~/database/typeorm/repositories/requestOvertimeDetail.repository';
import { RoleRepository } from '~/database/typeorm/repositories/role.repository';
import { ShiftRepository } from '~/database/typeorm/repositories/shift.repository';
import { StocktakeRepository } from '~/database/typeorm/repositories/stocktake.repository';
import { StocktakeDetailRepository } from '~/database/typeorm/repositories/stocktakeDetail.repository';
import { TaskRepository } from '~/database/typeorm/repositories/task.repository';
import { TimeAttendanceRepository } from '~/database/typeorm/repositories/timeAttendance.repository';
import { TravelPaperRepository } from '~/database/typeorm/repositories/travelPaper.repository';
import { TravelPaperDetailRepository } from '~/database/typeorm/repositories/travelPaperDetail.repository';
import { UnitRepository } from '~/database/typeorm/repositories/unit.repository';
import { UserRepository } from '~/database/typeorm/repositories/user.repository';
import { UserLogRepository } from '~/database/typeorm/repositories/userLog.repository';
import { UserShiftRepository } from '~/database/typeorm/repositories/userShift.repository';
import { VehicleRepository } from '~/database/typeorm/repositories/vehicle.repository';
import { WarehouseRepository } from '~/database/typeorm/repositories/warehouse.repository';
import { WarehousingBillRepository } from '~/database/typeorm/repositories/warehousingBill.repository';
import { WarehousingBillDetailRepository } from '~/database/typeorm/repositories/warehousingBillDetail.repository';
import { CacheService } from '~/shared/services/cache.service';
import { LeaveApplicationRepository } from './repositories/leaveApplication.repository';
import { ApprovalHistoryRepository } from '~/database/typeorm/repositories/approvalHistory.repository';
import { DocumentAccessControlRepository } from '~/database/typeorm/repositories/documentAccessControl.repository';
import { ResignationLetterRepository } from '~/database/typeorm/repositories/resignationLetter.repository';
import { TrackingLogRepository } from '~/database/typeorm/repositories/trackingLog.repository';
import { TrackingLogDetailRepository } from '~/database/typeorm/repositories/trackingLogDetail.repository';
import { RiceCouponRepository } from '~/database/typeorm/repositories/riceCoupon.repository';
import { RiceCouponDetailRepository } from '~/database/typeorm/repositories/riceCouponDetail.repository';
import { FoodVoucherRepository } from '~/database/typeorm/repositories/foodVoucher.repository';
import { FoodVoucherDetailRepository } from '~/database/typeorm/repositories/foodVoucherDetail.repository';
import { LeavingLateEarlyRepository } from '~/database/typeorm/repositories/leavingLateEarly.repository';
import { ForgotCheckinOutRepository } from '~/database/typeorm/repositories/forgotCheckinOut.repository';

@Injectable()
export class DatabaseService {
    constructor(
        private readonly cacheService: CacheService,
        public readonly dataSource: DataSource,
        public readonly department: DepartmentRepository,
        public readonly user: UserRepository,
        public readonly account: AccountRepository,
        public readonly media: MediaRepository,
        public readonly permission: PermissionRepository,
        public readonly role: RoleRepository,
        public readonly userLog: UserLogRepository,
        public readonly warehouse: WarehouseRepository,
        public readonly product: ProductRepository,
        public readonly productCategory: ProductCategoryRepository,
        public readonly inventory: InventoryRepository,
        public readonly unit: UnitRepository,
        public readonly inventoryHistory: InventoryHistoryRepository,
        public readonly quantityLimit: QuantityLimitRepository,
        public readonly proposal: ProposalRepository,
        public readonly proposalDetail: ProposalDetailRepository,
        public readonly productMeta: ProductMetaRepository,
        public readonly approvalProcess: ApprovalProcessRepository,
        public readonly warehousingBill: WarehousingBillRepository,
        public readonly warehousingBillDetail: WarehousingBillDetailRepository,
        public readonly stocktake: StocktakeRepository,
        public readonly stocktakeDetail: StocktakeDetailRepository,
        public readonly order: OrderRepository,
        public readonly orderItem: OrderItemRepository,
        public readonly orderProgressTracking: OrderProgressTrackingRepository,
        public readonly receipt: ReceiptRepository,
        public readonly vehicle: VehicleRepository,
        public readonly repairRequest: RepairRequestRepository,
        public readonly repairDetail: RepairDetailRepository,
        public readonly repairProgress: RepairProgressRepository,
        public readonly notification: NotificationRepository,
        public readonly notificationDetail: NotificationDetailRepository,
        public readonly calendar: CalendarRepository,
        public readonly timeAttendance: TimeAttendanceRepository,
        public readonly task: TaskRepository,
        public readonly freeTimekeeping: FreeTimekeepingRepository,
        public readonly position: PositionRepository,
        public readonly contract: ContractRepository,
        public readonly holiday: HolidayRepository,
        public readonly shift: ShiftRepository,
        public readonly userShift: UserShiftRepository,
        public readonly asset: AssetRepository,
        public readonly approvalConfig: ApprovalConfigRepository,
        public readonly positionGroup: PositionGroupRepository,
        public readonly leaveApplication: LeaveApplicationRepository,
        public readonly paymentOrder: PaymentOrderRepository,
        public readonly requestAdvancePayment: RequestAdvancePaymentRepository,
        public readonly requestAdvancePaymentDetail: RequestAdvancePaymentDetailRepository,
        public readonly requestOvertime: RequestOvertimeRepository,
        public readonly requestOvertimeDetail: RequestOvertimeDetailRepository,
        public readonly paymentRequestList: PaymentRequestListRepository,
        public readonly paymentRequestDetail: PaymentRequestDetailRepository,
        public readonly drivingOrder: DrivingOrderRepository,
        public readonly drivingOrderDetail: DrivingOrderDetailRepository,
        public readonly travelPaper: TravelPaperRepository,
        public readonly travelPaperDetail: TravelPaperDetailRepository,
        public readonly confirmPortal: ConfirmPortalRepository,
        public readonly confirmPortalDetail: ConfirmPortalDetailRepository,
        public readonly approvalHistory: ApprovalHistoryRepository,
        public readonly documentAccessControl: DocumentAccessControlRepository,
        public readonly resignationLetter: ResignationLetterRepository,
        public readonly trackingLog: TrackingLogRepository,
        public readonly trackingLogDetail: TrackingLogDetailRepository,
        public readonly riceCoupon: RiceCouponRepository,
        public readonly riceCouponDetail: RiceCouponDetailRepository,
        public readonly foodVoucher: FoodVoucherRepository,
        public readonly foodVoucherDetail: FoodVoucherDetailRepository,
        public readonly leavingLateEarly: LeavingLateEarlyRepository,
        public readonly forgotCheckinOut: ForgotCheckinOutRepository,
    ) {
        // load all departments to cache
        // this.loadDepartmentsToCache();
        // this.loadPermissionsByRoleToCache();
        this.loadPermissionsByPositionToCache();
    }

    private loadDepartmentsToCache() {
        this.department.find().then((departments) => {
            departments.forEach((department) => {
                this.cacheService.setJson(`department:${department.id}`, department, CACHE_TIME.ONE_MONTH);
            });
        });
    }

    private loadPermissionsByRoleToCache() {
        this.role.find({ relations: ['permissions'] }).then((roles) => {
            roles.forEach((role) => {
                this.cacheService.setJson(
                    `permissions:${role.id}`,
                    role.permissions.map((p) => p.action),
                    CACHE_TIME.ONE_MONTH,
                );
            });
        });
    }

    loadPermissionsByPositionToCache() {
        this.position.find({ relations: ['roles', 'roles.permissions'] }).then((positions) => {
            positions.forEach((position) => {
                this.cacheService.setJson(
                    `permissions:${position.id}`,
                    position.roles.map((r) => r.permissions.map((p) => p.action)).flat(),
                    CACHE_TIME.ONE_MONTH,
                );
            });
        });
    }

    async getUserIdsByPermission(permission: string): Promise<number[]> {
        const result = await this.dataSource.query(
            'SELECT DISTINCT id FROM users WHERE position_id IN (SELECT position_id FROM roles_positions WHERE role_id IN (SELECT role_id FROM roles_permissions WHERE permission_id IN (SELECT id FROM permissions WHERE action = ?)))',
            [permission],
        );

        return result.map((r) => r?.id).filter((id) => id);
    }
}
