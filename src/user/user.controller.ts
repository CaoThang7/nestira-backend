import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('seed')
  async seed() {
    const message = await this.userService.createDemoAdminIfNotExists();
    return { message };
  }
}
