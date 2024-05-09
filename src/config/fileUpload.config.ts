import { UtilService } from './../shared/services/util.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import fs from 'fs';
import moment from 'moment';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { MEDIA_TYPE } from '~/common/enums/enum';

export const multerOptions = (): MulterOptions => ({
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB in bytes
    },
    storage: diskStorage({
        destination: function (req, file, cb) {
            const filePath = `./public/upload/temp`;
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, { recursive: true });
            }
            cb(null, filePath);
        },
        filename: (req: any, file: any, cb: any) => {
            cb(null, `${moment().unix()}-${uuid()}${extname(file.originalname)}`);
        },
    }),
    fileFilter: (req: any, file: any, cb: any) => {
        checkMimeTypeCallback(file, cb);
    },
});

function generateFilename(file) {
    return `${Date.now()}.${extname(file.originalname)}`;
}

function checkMimeTypeCallback(file, cb) {
    const mimeTypes = [
        'image/jpg',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/bmp',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/pdf',
        'application/msword',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    const filetypes = /jpg|jpeg|png|gif|bmp|xlsx|pdf|doc|docx|ppt|pptx/;
    const mimetype = mimeTypes.includes(file.mimetype);
    const checkExtname = filetypes.test(extname(file.originalname));

    if (mimetype && checkExtname) {
        return cb(null, true);
    }

    cb(
        new HttpException(
            {
                result: false,
                message: `Unsupported file type ${extname(file.originalname)}`,
                data: null,
            },
            HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        ),
        false,
    );
}

function getFilePathByType(type: MEDIA_TYPE) {
    switch (type) {
        case MEDIA_TYPE.IMAGE:
            return 'image';
        case MEDIA_TYPE.VIDEO:
            return 'video';
        case MEDIA_TYPE.DOCUMENT:
            return 'document';
        case MEDIA_TYPE.AUDIO:
            return 'audio';
        default:
            return 'misc';
    }
}

function checkFileType(file: Express.Multer.File) {
    // Read the file's MIME type
    // const mimeType = mime.getType(filePath);
    const mimeType = file.mimetype;

    // Check if the MIME type belongs to an image, video or document
    if (mimeType.startsWith('image/')) {
        return MEDIA_TYPE.IMAGE;
    } else if (mimeType.startsWith('video/')) {
        return MEDIA_TYPE.VIDEO;
    } else if (
        [
            'application/pdf',
            'application/msword',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ].includes(mimeType)
    ) {
        return MEDIA_TYPE.DOCUMENT;
    } else {
        // File is of some other type
        return MEDIA_TYPE.MISC;
    }
}
