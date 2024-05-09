import { Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor {
    intercept(context, next) {
        return next.handle().pipe(
            map((data: object) => {
                if (!data) {
                    return {
                        result: false,
                        message: '[Interceptor] No data returned',
                        data: null,
                        pagination: undefined,
                    };
                }

                const res = data['data'] || data;
                return {
                    result: !!res,
                    message: res ? data['message'] || 'Success' : data['message'] || 'Fail',
                    data: res,
                    pagination: data['pagination'] || undefined,
                };
            }),
        );
    }
}
