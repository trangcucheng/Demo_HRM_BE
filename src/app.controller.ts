import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { Permission } from '~/common/decorators/permission.decorator';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @ApiQuery({ name: 'string' })
    @Permission(BYPASS_PERMISSION)
    @Get('test')
    test(@Query('string') str: string) {
        return this.appService.test(str);
    }
}
