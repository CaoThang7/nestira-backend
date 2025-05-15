import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['api-access-key'];
    const validKey = process.env.SECURE_API_ACCESS_KEY;

    if (!apiKey || apiKey !== validKey) {
      throw new UnauthorizedException('Invalid API access key');
    }

    return true;
  }
}
