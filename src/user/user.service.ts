import { User } from './user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findByUsername(username: string) {
    return this.repo.findOne({ where: { username } });
  }

  async createDemoAdminIfNotExists(): Promise<string> {
    const bcrypt = require('bcrypt');
    const adminPassword: any = process.env.DEFAULT_ADMIN_PASSWORD;
    const demoPassword: any = process.env.DEFAULT_DEMO_PASSWORD;

    const checkAdmin = await this.repo.findOne({
      where: { username: 'admin' },
    });
    if (!checkAdmin) {
      await this.repo.save({
        username: 'admin',
        password: await bcrypt.hash(adminPassword, 10),
        role: 'admin',
      });
      return 'Admin account created';
    }

    const checkDemo = await this.repo.findOne({ where: { username: 'demo' } });
    if (!checkDemo) {
      await this.repo.save({
        username: 'demo',
        password: await bcrypt.hash(demoPassword, 10),
        role: 'demo',
      });
      return 'Demo account created';
    }

    return 'Admin account already exists';
  }
}
