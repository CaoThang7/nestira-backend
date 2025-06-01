import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Locale = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const locale = request.headers['locale-language'];
    return typeof locale === 'string' ? locale : 'vi';
  },
);
