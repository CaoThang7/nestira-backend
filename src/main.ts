import helmet from 'helmet';
import * as dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    process.env.DOMAIN_LOCAL,
    process.env.DOMAIN_NESTIRA,
  ].filter(Boolean);

  app.enableCors({
    origin: (origin: any, callback: any) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  app.use(helmet());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
    }),
  );

  app.setGlobalPrefix('apis/svc');
  
  app.useGlobalGuards(new ApiKeyGuard());

  const port = parseInt(process.env.PORT || '5000');
  await app.listen(port);
  console.log(`🚀 App is running on: http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start app:', err);
});
