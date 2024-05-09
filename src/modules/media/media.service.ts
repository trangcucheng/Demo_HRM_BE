import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '~/database/typeorm/database.service';
import { UtilService } from '~/shared/services';

@Injectable()
export class MediaService {
    constructor(private readonly database: DatabaseService, private readonly utilService: UtilService) {}

    findAll() {
        return `This action returns all media`;
    }

    findOne(id: number) {
        return `This action returns a #${id} media`;
    }

    async remove(id: number) {
        try {
            const media = await this.database.media.findOneBy({ id });
            if (!media) {
                return false;
            }

            const filePath = `.${media.path}`;
            return this.utilService.removeFile(filePath);
        } catch (error) {
            Logger.error(error.message, 'MediaService');
            return false;
        }
    }
}
