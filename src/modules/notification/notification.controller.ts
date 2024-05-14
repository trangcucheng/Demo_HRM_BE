import { Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { NotificationService } from './notification.service';
import { NOTIFICATION_TYPE } from '~/common/enums/enum';

@ApiTags('Notification')
@ApiBasicAuth('authorization')
@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Permission(BYPASS_PERMISSION)
    @Get()
    @ApiQuery({ name: 'lang', required: false })
    @ApiQuery({
        name: 'type',
        enum: NOTIFICATION_TYPE,
        required: false,
    })
    findAll(@Query() queries: FilterDto, @Query('lang') lang: string, @Query('type') type: string) {
        return this.notificationService.findAll({ ...queries, lang, type });
    }

    @Permission(BYPASS_PERMISSION)
    @Get('unread')
    countUnread() {
        return this.notificationService.countUnread();
    }

    @Permission(BYPASS_PERMISSION)
    @Patch('mark-all-as-read')
    markAllAsRead() {
        return this.notificationService.markAllAsRead();
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id')
    @ApiQuery({ name: 'lang', required: false })
    findOne(@Param('id', ParseIntPipe) id: string, @Query('lang') lang: string) {
        return this.notificationService.findOne(id, lang);
    }

    @Permission(BYPASS_PERMISSION)
    @Patch(':id/mark-as-read')
    markAsRead(@Param('id') id: string) {
        return this.notificationService.markAsRead(id);
    }
}
