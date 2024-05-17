import { BadRequestException, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBasicAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { BYPASS_PERMISSION } from '~/common/constants/constant';
import { Permission } from '~/common/decorators/permission.decorator';
import { multerOptions } from '~/config/fileUpload.config';
import { UtilService } from '~/shared/services';
import { MediaService } from './media.service';

import * as Minio from 'minio';
import fs from 'fs';

const minioClient: Minio.Client = new Minio.Client({
    endPoint: 'play.min.io',
    port: 9000,
    useSSL: false,
    accessKey: 'HE2getRa3nM0bDUFafrJ',
    secretKey: 'rOBnWrDSJTIuW0tsUvx3G78F8hI4KbHpamYWyyli',
});


@ApiTags('Media')
@ApiBasicAuth('authorization')
@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService, private readonly utilService: UtilService) { }

    @ApiConsumes('multipart/form-data')
    @ApiBody({
        required: true,
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @Permission(BYPASS_PERMISSION)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', multerOptions()))
    async upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
        const media = await this.utilService.handleUploadedFile(file, req.headers['_userId'], null);
        if (!media) throw new BadRequestException('File invalid');

        return {
            result: true,
            message: 'Upload success',
            data: media,
        };
    }

    @Get()
    findAll() {
        return this.mediaService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.mediaService.findOne(+id);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.mediaService.remove(+id);
    }
}
