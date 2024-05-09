import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DatabaseService } from '~/database/typeorm/database.service';
import { AccountEntity } from '~/database/typeorm/entities/account.entity';
import { ApprovalConfigEntity } from '~/database/typeorm/entities/approvalConfig.entity';
import { ApprovalHistoryEntity } from '~/database/typeorm/entities/approvalHistory.entity';
import { ApprovalProcessEntity } from '~/database/typeorm/entities/approvalProcess.entity';
import { AssetEntity } from '~/database/typeorm/entities/asset.entity';
import { CalendarEntity } from '~/database/typeorm/entities/calendar.entity';
import { ConfirmPortalEntity } from '~/database/typeorm/entities/confirmPortal.entity';
import { ConfirmPortalDetailEntity } from '~/database/typeorm/entities/confirmPortalDetail.entity';
import { ContractEntity } from '~/database/typeorm/entities/contract.entity';
import { DepartmentEntity } from '~/database/typeorm/entities/department.entity';
import { DepartmentTaskEntity } from '~/database/typeorm/entities/departmentTask.entity';
import { DisciplineEntity } from '~/database/typeorm/entities/discipline.entity';
import { DocumentEntity } from '~/database/typeorm/entities/document.entity';
import { DocumentAccessControlEntity } from '~/database/typeorm/entities/documentAccessControl.entity';
import { DrivingOrderEntity } from '~/database/typeorm/entities/drivingOrder.entity';
import { DrivingOrderDetailEntity } from '~/database/typeorm/entities/drivingOrderDetail.entity';
import { FreeTimekeepingEntity } from '~/database/typeorm/entities/freeTimekeeping.entity';
import { HolidayEntity } from '~/database/typeorm/entities/holiday.entity';
import { InventoryEntity } from '~/database/typeorm/entities/inventory.entity';
import { InventoryHistoryEntity } from '~/database/typeorm/entities/inventoryHistory.entity';
import { LeaveApplicationEntity } from '~/database/typeorm/entities/leaveApplication.entity';
import { MediaEntity } from '~/database/typeorm/entities/media.entity';
import { NotificationEntity } from '~/database/typeorm/entities/notification.entity';
import { NotificationDetailEntity } from '~/database/typeorm/entities/notificationDetail.entity';
import { OrderEntity } from '~/database/typeorm/entities/order.entity';
import { OrderItemEntity } from '~/database/typeorm/entities/orderItem.entity';
import { OrderProgressTrackingEntity } from '~/database/typeorm/entities/orderProgressTracking.entity';
import { PaymentOrderEntity } from '~/database/typeorm/entities/paymentOrder.entity';
import { PaymentRequestDetailEntity } from '~/database/typeorm/entities/paymentRequestDetail.entity';
import { PaymentRequestListEntity } from '~/database/typeorm/entities/paymentRequestList.entity';
import { PermissionEntity } from '~/database/typeorm/entities/permission.entity';
import { PositionEntity } from '~/database/typeorm/entities/position.entity';
import { PositionGroupEntity } from '~/database/typeorm/entities/positionGroup.entity';
import { ProductEntity } from '~/database/typeorm/entities/product.entity';
import { ProductCategoryEntity } from '~/database/typeorm/entities/productCategory.entity';
import { ProductMetaEntity } from '~/database/typeorm/entities/productMeta.entity';
import { ProposalEntity } from '~/database/typeorm/entities/proposal.entity';
import { ProposalDetailEntity } from '~/database/typeorm/entities/proposalDetail.entity';
import { QuantityLimitEntity } from '~/database/typeorm/entities/quantityLimit.entity';
import { ReceiptEntity } from '~/database/typeorm/entities/receipt.entity';
import { RepairDetailEntity } from '~/database/typeorm/entities/repairDetail.entity';
import { RepairProgressEntity } from '~/database/typeorm/entities/repairProgress.entity';
import { RepairRequestEntity } from '~/database/typeorm/entities/repairRequest.entity';
import { RequestAdvancePaymentEntity } from '~/database/typeorm/entities/requestAdvancePayment.entity';
import { RequestAdvancePaymentDetailEntity } from '~/database/typeorm/entities/requestAdvancePaymentDetail.entity';
import { RequestOvertimeEntity } from '~/database/typeorm/entities/requestOvertime.entity';
import { RequestOvertimeDetailEntity } from '~/database/typeorm/entities/requestOvertimeDetail.entity';
import { RewardEntity } from '~/database/typeorm/entities/reward.entity';
import { RoleEntity } from '~/database/typeorm/entities/role.entity';
import { SendDocumentEntity } from '~/database/typeorm/entities/sendDocument.entity';
import { ShiftEntity } from '~/database/typeorm/entities/shift.entity';
import { StocktakeEntity } from '~/database/typeorm/entities/stocktake.entity';
import { StocktakeDetailEntity } from '~/database/typeorm/entities/stocktakeDetail.entity';
import { TaskEntity } from '~/database/typeorm/entities/task.entity';
import { TextEmbryoEntity } from '~/database/typeorm/entities/textEmbryo.entity';
import { TimeAttendanceEntity } from '~/database/typeorm/entities/timeAttendance.entity';
import { TravelPaperEntity } from '~/database/typeorm/entities/travelPaper.entity';
import { TravelPaperDetailEntity } from '~/database/typeorm/entities/travelPaperDetail.entity';
import { UnitEntity } from '~/database/typeorm/entities/unit.entity';
import { UserEntity } from '~/database/typeorm/entities/user.entity';
import { UserLogEntity } from '~/database/typeorm/entities/userLog.entity';
import { UserShiftEntity } from '~/database/typeorm/entities/userShift.entity';
import { VehicleEntity } from '~/database/typeorm/entities/vehicle.entity';
import { WarehouseEntity } from '~/database/typeorm/entities/warehouse.entity';
import { WarehousingBillEntity } from '~/database/typeorm/entities/warehousingBill.entity';
import { WarehousingBillDetailEntity } from '~/database/typeorm/entities/warehousingBillDetail.entity';
import { AccountRepository } from '~/database/typeorm/repositories/account.repository';
import { ApprovalConfigRepository } from '~/database/typeorm/repositories/approvalConfig.repository';
import { ApprovalHistoryRepository } from '~/database/typeorm/repositories/approvalHistory.repository';
import { ApprovalProcessRepository } from '~/database/typeorm/repositories/approvalProcess.repository';
import { AssetRepository } from '~/database/typeorm/repositories/asset.repository';
import { CalendarRepository } from '~/database/typeorm/repositories/calendar.repository';
import { ConfirmPortalRepository } from '~/database/typeorm/repositories/confirmPortal.repository';
import { ConfirmPortalDetailRepository } from '~/database/typeorm/repositories/confirmPortalDetail.repository';
import { ContractRepository } from '~/database/typeorm/repositories/contract.repository';
import { DepartmentRepository } from '~/database/typeorm/repositories/department.repository';
import { DocumentAccessControlRepository } from '~/database/typeorm/repositories/documentAccessControl.repository';
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
import { LeaveApplicationRepository } from './repositories/leaveApplication.repository';
import { ResignationLetterEntity } from '~/database/typeorm/entities/resignationLetter.entity';
import { ResignationLetterRepository } from '~/database/typeorm/repositories/resignationLetter.repository';
import { TrackingLogEntity } from '~/database/typeorm/entities/trackingLog.entity';
import { TrackingLogRepository } from '~/database/typeorm/repositories/trackingLog.repository';
import { TrackingLogDetailEntity } from '~/database/typeorm/entities/trackingLogDetail.entity';
import { TrackingLogDetailRepository } from '~/database/typeorm/repositories/trackingLogDetail.repository';
import { RiceCouponEntity } from '~/database/typeorm/entities/riceCoupon.entity';
import { RiceCouponRepository } from '~/database/typeorm/repositories/riceCoupon.repository';
import { RiceCouponDetailEntity } from '~/database/typeorm/entities/riceCouponDetail.entity';
import { RiceCouponDetailRepository } from '~/database/typeorm/repositories/riceCouponDetail.repository';
import { FoodVoucherEntity } from '~/database/typeorm/entities/foodVoucher.entity';
import { FoodVoucherRepository } from '~/database/typeorm/repositories/foodVoucher.repository';
import { FoodVoucherDetailEntity } from '~/database/typeorm/entities/foodVoucherDetail.entity';
import { FoodVoucherDetailRepository } from '~/database/typeorm/repositories/foodVoucherDetail.repository';
import { LeavingLateEarlyEntity } from '~/database/typeorm/entities/leavingLateEarly.entity';
import { LeavingLateEarlyRepository } from '~/database/typeorm/repositories/leavingLateEarly.repository';
import { ForgotCheckinOutEntity } from '~/database/typeorm/entities/forgotCheckinOut.entity';
import { ForgotCheckinOutRepository } from '~/database/typeorm/repositories/forgotCheckinOut.repository';

const entities = [
    RoleEntity,
    UserEntity,
    PermissionEntity,
    MediaEntity,
    AccountEntity,
    DepartmentEntity,
    WarehouseEntity,
    UserLogEntity,
    ProductEntity,
    ProductCategoryEntity,
    InventoryEntity,
    UnitEntity,
    InventoryHistoryEntity,
    QuantityLimitEntity,
    ProposalEntity,
    ProposalDetailEntity,
    ProductMetaEntity,
    ApprovalProcessEntity,
    WarehousingBillEntity,
    WarehousingBillDetailEntity,
    StocktakeEntity,
    StocktakeDetailEntity,
    OrderEntity,
    OrderItemEntity,
    OrderProgressTrackingEntity,
    ReceiptEntity,
    VehicleEntity,
    RepairRequestEntity,
    RepairDetailEntity,
    RepairProgressEntity,
    NotificationEntity,
    NotificationDetailEntity,
    DepartmentEntity,
    CalendarEntity,
    ContractEntity,
    PositionEntity,
    LeaveApplicationEntity,
    ShiftEntity,
    DisciplineEntity,
    TimeAttendanceEntity,
    TaskEntity,
    DepartmentTaskEntity,
    RewardEntity,
    AssetEntity,
    DocumentEntity,
    SendDocumentEntity,
    TextEmbryoEntity,
    UserShiftEntity,
    FreeTimekeepingEntity,
    HolidayEntity,
    ApprovalConfigEntity,
    PositionGroupEntity,
    RequestAdvancePaymentEntity,
    RequestAdvancePaymentDetailEntity,
    PaymentOrderEntity,
    RequestOvertimeEntity,
    RequestOvertimeDetailEntity,
    PaymentRequestListEntity,
    PaymentRequestDetailEntity,
    DrivingOrderEntity,
    DrivingOrderDetailEntity,
    TravelPaperEntity,
    TravelPaperDetailEntity,
    ConfirmPortalEntity,
    ConfirmPortalDetailEntity,
    ApprovalHistoryEntity,
    DocumentAccessControlEntity,
    ResignationLetterEntity,
    TrackingLogEntity,
    TrackingLogDetailEntity,
    RiceCouponEntity,
    RiceCouponDetailEntity,
    FoodVoucherEntity,
    FoodVoucherDetailEntity,
    LeavingLateEarlyEntity,
    ForgotCheckinOutEntity,
];

const repositories = [
    DepartmentRepository,
    UserRepository,
    AccountRepository,
    MediaRepository,
    PermissionRepository,
    RoleRepository,
    WarehouseRepository,
    UserLogRepository,
    ProductRepository,
    ProductCategoryRepository,
    InventoryRepository,
    UnitRepository,
    InventoryHistoryRepository,
    QuantityLimitRepository,
    ProposalRepository,
    ProposalDetailRepository,
    ProductMetaRepository,
    ApprovalProcessRepository,
    WarehousingBillRepository,
    WarehousingBillDetailRepository,
    StocktakeRepository,
    StocktakeDetailRepository,
    OrderRepository,
    OrderItemRepository,
    OrderProgressTrackingRepository,
    ReceiptRepository,
    VehicleRepository,
    RepairRequestRepository,
    RepairDetailRepository,
    RepairProgressRepository,
    NotificationRepository,
    NotificationDetailRepository,
    CalendarRepository,
    TimeAttendanceRepository,
    TaskRepository,
    FreeTimekeepingRepository,
    PositionRepository,
    ContractRepository,
    HolidayRepository,
    ShiftRepository,
    UserShiftRepository,
    AssetRepository,
    ApprovalConfigRepository,
    PositionGroupRepository,
    LeaveApplicationRepository,
    PaymentOrderRepository,
    RequestAdvancePaymentRepository,
    RequestAdvancePaymentDetailRepository,
    RequestOvertimeRepository,
    RequestOvertimeDetailRepository,
    PaymentRequestListRepository,
    PaymentRequestDetailRepository,
    DrivingOrderRepository,
    DrivingOrderDetailRepository,
    TravelPaperRepository,
    TravelPaperDetailRepository,
    ConfirmPortalRepository,
    ConfirmPortalDetailRepository,
    ApprovalHistoryRepository,
    DocumentAccessControlRepository,
    ResignationLetterRepository,
    TrackingLogRepository,
    TrackingLogDetailRepository,
    RiceCouponRepository,
    RiceCouponDetailRepository,
    FoodVoucherRepository,
    FoodVoucherDetailRepository,
    LeavingLateEarlyRepository,
    ForgotCheckinOutRepository,
];

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            name: 'default', // HERE
            useFactory: (configService: ConfigService) => ({
                ...configService.get('database'),
                entities,
            }),
            inject: [ConfigService],
            // dataSource receives the configured DataSourceOptions
            // and returns a Promise<DataSource>.
            dataSourceFactory: async (options) => {
                const dataSource = await new DataSource(options).initialize();
                return dataSource;
            },
        }),
        // TypeOrmModule.forFeature(entities),
    ],
    providers: [DatabaseService, ...repositories],
    exports: [DatabaseService],
})
export class DatabaseModule {}
