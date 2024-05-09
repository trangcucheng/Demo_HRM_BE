import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { TypeORMError } from 'typeorm';

@Catch(TypeORMError)
export class TypeOrmFilter implements ExceptionFilter {
    catch(exception: TypeORMError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const message: string = exception.message;
        const code: number = (exception as any).code;
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const error = this.handleError(exception);
        Logger.error(`[${status}] {${request.url}, ${response?.req?.route?.path}, ${request.method}}: ${exception?.message}`, 'ExceptionFilter');
        response.status(error.code).json({
            result: false,
            message: error.message,
            data: { code: code, message: message },
            statusCode: error.code,
            // errors: [{ code: code, message: message }],
            // errorCode: 300,
        });
    }

    private handleError(error) {
        const field = this.parseField(error?.detail?.match(/Key \((\w+)\)=/), error.detail);
        /**
         * Note:
         * this is just error code of postgresql
         * not implement mysql yet
         * */
        switch (error.code) {
            case '23505':
                return { code: 409, message: `Trùng ${field}` };
            case '23503':
                return { code: 409, message: `Không tồn tại (${error.detail})` };
            case '22P02':
                return { code: 400, message: `Sai kiểu dữ liệu` };
            case '22001':
                return { code: 400, message: `Dữ liệu quá dài` };
            case '23502':
                return { code: 400, message: `Thiếu trường bắt buộc` };
            case '42703':
                return { code: 500, message: `Trường không tồn tại` };
            case 'ER_DATA_TOO_LONG':
                return { code: 400, message: `Dữ liệu quá dài` };
            case 'ER_DUP_ENTRY':
                return { code: 409, message: `Trùng dữ liệu` };
            case 'ER_NO_REFERENCED_ROW_2':
                return { code: 409, message: `Không tồn tại các dữ liệu liên quan` };
            case 'ER_BAD_NULL_ERROR':
                return { code: 400, message: `Thiếu trường bắt buộc` };
            case 'ER_BAD_FIELD_ERROR':
                return { code: 500, message: `Trường không tồn tại` };
            case 'ER_NO_DEFAULT_FOR_FIELD':
                return { code: 400, message: `Thiếu trường bắt buộc` };
            default:
                return { code: 500, message: `Lỗi hệ thống` };
        }
    }

    private parseField(field: string, detail: string) {
        if (!field) return `dữ liệu (${detail?.replace('Key ', '')?.replace(' already exists.', '')})`;
        switch (field[1]) {
            case 'registration_no':
                return 'Số đăng bộ';
            case 'citizen_id':
                return 'Số CCCD/CMND';
            default:
                return field[1] || 'dữ liệu';
        }
    }
}
