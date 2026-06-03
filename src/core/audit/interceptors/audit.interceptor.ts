import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AUDIT_ACTION_KEY } from '../decorators/audit.decorator';
import { AuditService } from '../services/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    const action = this.reflector.get<string>(AUDIT_ACTION_KEY, context.getHandler());
    
    // Si no tiene el decorador @AuditAction, se deja pasar
    if (!action) return next.handle();

    return next.handle().pipe(
      tap(async () => {
        const user = request.user;
        
        await this.auditService.createLog({
          userId: user?.id,
          action,
          method: request.method,
          url: request.url,
          payload: request.body,
          ip: request.ip || request.headers['x-forwarded-for'],
        });
      }),
    );
  }
}