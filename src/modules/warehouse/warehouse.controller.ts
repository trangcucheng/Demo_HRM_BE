import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { ImportGoodDto } from '~/modules/warehouse/dto/import-good.dto';
import { UpdateGoodDto } from '~/modules/warehouse/dto/update-good.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseService } from './warehouse.service';

@ApiTags('Warehouse')
@ApiBasicAuth('authorization')
@Controller('warehouse')
export class WarehouseController {
    constructor(private readonly warehouseService: WarehouseService) {}

    @Permission('warehouse:create')
    @Post()
    create(@Body() createWarehouseDto: CreateWarehouseDto) {
        return this.warehouseService.create(createWarehouseDto);
    }

    @Permission('warehouse:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    @ApiQuery({ name: 'typeId', required: false, type: Number })
    findAll(@Query() queries, @Query('typeId', new ParseIntPipe({ optional: true })) typeId: string) {
        return this.warehouseService.findAll({ ...queries, typeId });
    }

    @Permission('warehouse:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.warehouseService.findOne(+id);
    }

    @Permission('warehouse:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateWarehouseDto: UpdateWarehouseDto) {
        return this.warehouseService.update(+id, updateWarehouseDto);
    }

    @Permission('warehouse:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.warehouseService.remove(+id);
    }
    @Permission('warehouse:get-products')
    @Get(':id/products')
    @ApiQuery({ type: FilterDto })
    getProducts(@Param('id', ParseIntPipe) id: string, @Query() queries) {
        return this.warehouseService.getProducts({ ...queries, warehouseId: +id });
    }

    @Permission('warehouse:import')
    @Post(':id/import')
    import(@Param('id', ParseIntPipe) id: string, @Body() importGoodDto: ImportGoodDto) {
        return this.warehouseService.importGoods(+id, importGoodDto);
    }

    @Permission('warehouse:import')
    @Post(':id/import-from-file/:fileId')
    importFromFile(@Param('id', ParseIntPipe) id: string, @Param('fileId', ParseIntPipe) fileId: string) {
        return this.warehouseService.importFromFile(+id, +fileId);
    }

    @Permission('warehouse:import')
    @Patch(':id/products/:inventoryId')
    updateGood(@Param('id', ParseIntPipe) id: string, @Param('inventoryId', ParseIntPipe) inventoryId: string, @Body() updateGoodDto: UpdateGoodDto) {
        return this.warehouseService.updateGood(+id, +inventoryId, updateGoodDto);
    }
}
