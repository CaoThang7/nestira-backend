import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Newsletters } from './newsletters.entity';
import { EmailModule } from 'src/email/email.module';
import { Promotion } from 'src/promotion/promotion.entity';
import { NewslettersService } from './newsletters.service';
import { NewslettersController } from './newsletters.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Newsletters, Promotion]), EmailModule],
  controllers: [NewslettersController],
  providers: [NewslettersService],
})
export class NewslettersModule {}
