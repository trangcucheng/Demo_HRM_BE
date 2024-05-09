import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '~/common/decorators/permission.decorator';
import { FilterDto } from '~/common/dtos/filter.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetService } from './asset.service';

@ApiTags('Asset')
@ApiBasicAuth('authorization')
@Controller('asset')
export class AssetController {
    constructor(private readonly assetService: AssetService) {}

    @Permission('asset:create')
    @Post()
    create(@Body() createAssetDto: CreateAssetDto) {
        return this.assetService.create(createAssetDto);
    }

    @Permission('asset:findAll')
    @Get()
    @ApiQuery({ type: FilterDto })
    findAll(@Query() queries) {
        return this.assetService.findAll({ ...queries });
    }

    @Permission('asset:findOne')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.assetService.findOne(+id);
    }

    @Permission('asset:update')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updateAssetDto: UpdateAssetDto) {
        return this.assetService.update(+id, updateAssetDto);
    }

    @Permission('asset:remove')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.assetService.remove(+id);
    }
}
