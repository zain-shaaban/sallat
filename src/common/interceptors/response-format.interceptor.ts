import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isTelegraf = context.getType() !== 'http';
    if (isTelegraf) {
      return next.handle();
    }
    return next.handle().pipe(map((data) => ({ status: true, data })));
  }
}
