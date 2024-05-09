import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        let message = `An error occurred with error code ${status}`;
        switch (status) {
            case 500:
                message = 'Internal server error';
                break;
            case 400:
                message = exception.response.message || exception.message || 'Bad request';
                break;
            case 401:
                message = exception.response.message || exception.message || 'Unauthorized';
                break;
            case 403:
                message = exception.response.message || exception.message || 'Forbidden';
                break;
            case 404:
                message = exception.response.message || exception.message || 'Not found';
                break;
            case 409:
                message = exception.response.message || exception.message || 'Conflict';
                break;
            case 417:
                message = exception.response.message || exception.message || 'Expectation Failed';
                break;
            case 422:
                message = exception.response.message || exception.message || 'Unprocessable Entity';
                break;
            default:
                message = exception.response.message || exception.message || message;
                break;
        }

        Logger.error(`[${status}] {${request.url}, ${response?.req?.route?.path}, ${request.method}}: ${exception?.message}`, 'ExceptionFilter');
        // console.error(exception, exception.stack);

        response.status(status).json({
            result: false,
            message: message,
            data: null,
            statusCode: status,
            // path: request.url,
        });
    }
}
