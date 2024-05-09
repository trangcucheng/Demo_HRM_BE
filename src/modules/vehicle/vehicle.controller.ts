import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { VehicleService } from './vehicle.service';

@ApiTags('Vehicle')
@ApiBasicAuth('authorization')
@Controller('vehicle')
export class VehicleController {
    constructor(private readonly vehicleService: VehicleService) {}

    // @Permission('vehicle:create')
    // @Post()
    // create(@Body() createVehicleDto: CreateVehicleDto) {
    //     return this.vehicleService.create(createVehicleDto);
    // }

    // @Permission(BYPASS_PERMISSION)
    // @Get()
    // @ApiQuery({ type: FilterDto })
    // findAll(@Query() queries) {
    //     return this.vehicleService.findAll({ ...queries });
    // }

    // @Permission(BYPASS_PERMISSION)
    // @Get(':id')
    // findOne(@Param('id', ParseIntPipe) id: string) {
    //     return this.vehicleService.findOne(+id);
    // }

    // @Permission('vehicle:update')
    // @Patch(':id')
    // update(@Param('id', ParseIntPipe) id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    //     return this.vehicleService.update(+id, updateVehicleDto);
    // }

    // @Permission('vehicle:remove')
    // @Delete(':id')
    // remove(@Param('id', ParseIntPipe) id: string) {
    //     return this.vehicleService.remove(+id);
    // }

    @Permission(BYPASS_PERMISSION)
    @Get(':id/history')
    @ApiQuery({ type: FilterDto })
    history(@Param('id', ParseIntPipe) id: string, @Query() queries) {
        return this.vehicleService.history({ ...queries, vehicleId: +id });
    }

    @Permission(BYPASS_PERMISSION)
    @Get(':id/history/:repairRequestId')
    historyDetail(@Param('id', ParseIntPipe) id: string, @Param('repairRequestId', ParseIntPipe) repairRequestId: string) {
        return this.vehicleService.historyDetail(+id, +repairRequestId);
    }
}
