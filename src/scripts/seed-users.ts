import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  await userService.createDemoAdminIfNotExists();

  await app.close();
  console.log('✅ Seed completed.');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
});
