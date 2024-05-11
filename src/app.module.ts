import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import { MiddlewareConsumer, Module, OnModuleInit, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { RedisModule } from 'nestjs-redis';
import path from 'path';
import { BYPASS_PERMISSION, ONLY_ADMIN } from '~/common/constants/constant';
import { AllExceptionsFilter } from '~/common/filters/exception.filter';
import { TypeOrmFilter } from '~/common/filters/typeorm.filter';
import { PermissionGuard } from '~/common/guards';
import { AuthMiddleware, LogMiddleware } from '~/common/middleware';
import { IsIdAlreadyExistConstraint } from '~/common/validators/is-id-exist.validator';
import database from '~/config/database.config';
import mail from '~/config/mail.config';
import redis from '~/config/redis.config';
import token from '~/config/token.config';
import { DatabaseModule } from '~/database/typeorm';
import { PermissionRepository } from '~/database/typeorm/repositories/permission.repository';
import { AccessControlModule } from '~/modules/access-control/access-control.module';
import { AssetModule } from '~/modules/asset/asset.module';
import { AuthModule } from '~/modules/auth/auth.module';
import { CalendarModule } from '~/modules/calendar/calendar.module';
import { ConfirmPortalModule } from '~/modules/confirm-portal/confirm-portal.module';
import { ContractModule } from '~/modules/contract/contract.module';
import { CronjobModule } from '~/modules/cronjob/cronjob.module';
import { DrivingOrderModule } from '~/modules/driving-order/driving-order.module';
import { DropdownModule } from '~/modules/dropdown/dropdown.module';
import { FreeTimekeepingModule } from '~/modules/free-timekeeping/free-timekeeping.module';
import { HolidayModule } from '~/modules/holiday/holiday.module';
import { HumanModule } from '~/modules/human/human.module';
import { LeaveApplicationModule } from '~/modules/leave-application/leave-application.module';
import { MailModule } from '~/modules/mail/mail.module';
import { MediaModule } from '~/modules/media/media.module';
import { NotificationModule } from '~/modules/notification/notification.module';
import { OrderModule } from '~/modules/order/order.module';
import { PaymentOrderModule } from '~/modules/payment-order/payment-order.module';
import { PaymentRequestListModule } from '~/modules/payment-request-list/payment-request-list.module';
import { PermissionModule } from '~/modules/permission/permission.module';
import { PositionGroupModule } from '~/modules/position-group/position-group.module';
import { PositionModule } from '~/modules/position/position.module';
import { ProfileModule } from '~/modules/profile/profile.module';
import { ProposalModule } from '~/modules/proposal/proposal.module';
import { RepairRequestModule } from '~/modules/repair-request/repair-request.module';
import { RequestAdvancePaymentModule } from '~/modules/request-advance-payment/request-advance-payment.module';
import { RequestOvertimeModule } from '~/modules/request-overtime/request-overtime.module';
import { RoleModule } from '~/modules/role/role.module';
import { ShiftModule } from '~/modules/shift/shift.module';
import { SocketModule } from '~/modules/socket/socket.module';
import { StatisticModule } from '~/modules/statistic/statistic.module';
import { StocktakeModule } from '~/modules/stocktake/stocktake.module';
import { TaskModule } from '~/modules/task/task.module';
import { TimeKeepingModule } from '~/modules/time-keeping/time-keeping.module';
import { TravelPaperModule } from '~/modules/travel-paper/travel-paper.module';
import { UserShiftModule } from '~/modules/user-shift/user-shift.module';
import { VehicleModule } from '~/modules/vehicle/vehicle.module';
import { WarehousingBillModule } from '~/modules/warehousing-bill/warehousing-bill.module';
import { UtilService } from '~/shared/services';
import { CacheService } from '~/shared/services/cache.service';
import { SharedModule } from '~/shared/shared.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DepartmentModule } from './modules/department/department.module';
import { ProductCategoryModule } from './modules/product-category/product-category.module';
import { ProductModule } from './modules/product/product.module';
import { UnitModule } from './modules/unit/unit.module';
import { UserModule } from './modules/user/user.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { ResignationLetterModule } from '~/modules/resignation-letter/resignation-letter.module';
import { TrackingLogModule } from '~/modules/tracking-log/tracking-log.module';
import { RiceCouponModule } from '~/modules/rice-coupon/rice-coupon.module';
import { FoodVoucherModule } from '~/modules/food-voucher/food-voucher.module';
import { LeavingLateEarlyModule } from '~/modules/leaving-late-early/leaving-late-early.module';
import { ForgotCheckinOutModule } from '~/modules/forgot-checkin-out/forgot-checkin-out.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
            load: [token, database, mail, redis],
            cache: true,
        }),
        RedisModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => configService.get('redis') || {},
            inject: [ConfigService],
        }),
        // MongooseModule.forRootAsync({
        //     imports: [ConfigModule],
        //     useFactory: async (configService: ConfigService) => ({
        //         uri: configService.get<string>('MONGODB_URI'),
        //     }),
        //     inject: [ConfigService],
        // }),
        I18nModule.forRoot({
            fallbackLanguage: 'en',
            loaderOptions: {
                path: path.join(__dirname, '/i18n/'),
                watch: true,
            },
            resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver, new HeaderResolver(['x-lang'])],
        }),
        EventEmitterModule.forRoot(),
        DatabaseModule,
        SharedModule,
        AuthModule,
        ProfileModule,
        RoleModule,
        PermissionModule,
        MailModule,
        DiscoveryModule,
        MediaModule,
        SocketModule,
        UserModule,
        DepartmentModule,
        WarehouseModule,
        ProductModule,
        ProductCategoryModule,
        UnitModule,
        ProposalModule,
        WarehousingBillModule,
        StocktakeModule,
        OrderModule,
        DropdownModule,
        RepairRequestModule,
        NotificationModule,
        StatisticModule,
        HumanModule,
        CalendarModule,
        TimeKeepingModule,
        TaskModule,
        FreeTimekeepingModule,
        PositionModule,
        ContractModule,
        HolidayModule,
        ShiftModule,
        UserShiftModule,
        AssetModule,
        VehicleModule,
        CronjobModule,
        PositionGroupModule,
        PaymentOrderModule,
        RequestAdvancePaymentModule,
        RequestOvertimeModule,
        PaymentRequestListModule,
        DrivingOrderModule,
        TravelPaperModule,
        ConfirmPortalModule,
        LeaveApplicationModule,
        AccessControlModule,
        ResignationLetterModule,
        TrackingLogModule,
        RiceCouponModule,
        FoodVoucherModule,
        LeavingLateEarlyModule,
        ForgotCheckinOutModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
        {
            provide: APP_FILTER,
            useClass: TypeOrmFilter,
        },
        {
            provide: APP_GUARD,
            useClass: PermissionGuard,
        },
        PermissionRepository,
        IsIdAlreadyExistConstraint,
    ],
})
// export class AppModule { }

// api protected by auth token middleware
// the middleware adds the user's _id to the req.body
export class AppModule implements OnModuleInit {
    constructor(
        private readonly discover: DiscoveryService,
        private readonly permissionRepositopry: PermissionRepository,
        private readonly cacheService: CacheService,
        private readonly utilService: UtilService,
    ) { }
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware, LogMiddleware)
            .exclude(
                { path: 'public/(.*)', method: RequestMethod.ALL },
                { path: 'docs', method: RequestMethod.ALL },
                { path: 'auth/(.*)', method: RequestMethod.ALL },
                { path: 'test', method: RequestMethod.ALL },
            )
            .forRoutes({ path: '*', method: RequestMethod.ALL });
    }

    onModuleInit() {
        // open this to insert permissions to database
        this.cacheService.deletePattern('');
        this.insertPermissions();
    }

    async insertPermissions() {
        const permissions = (await this.discover.controllerMethodsWithMetaAtKey<string>('permission')).sort((a, b) => {
            return a.meta[0] > b.meta[0] ? 1 : -1;
        });

        for (const permission of permissions) {
            const actions = permission.meta?.length === 1 ? [permission.meta[0]] : permission.meta;
            for (const action of actions) {
                if ([BYPASS_PERMISSION, ONLY_ADMIN].includes(action)) continue;

                const permissionEntity = this.permissionRepositopry.create({
                    name:
                        (this.utilService.capitalizeFirstLetter(permission.discoveredMethod.methodName?.split(/(?=[A-Z])/)?.join(' ')) || '') +
                        ' ' +
                        permission.discoveredMethod.parentClass.name.replace('Controller', ''),
                    action: action,
                    type: action.split(':')[0],
                });

                const p = await this.permissionRepositopry.findOne({ where: { action: action } });
                if (!p) {
                    const res = await this.permissionRepositopry.insert(permissionEntity);
                    console.log('LOG:: Permission inserted:', res.identifiers[0].id, permissionEntity.action);
                }
            }
        }
    }
}
