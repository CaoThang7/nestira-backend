import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Newsletters } from './newsletters.entity';
import { EmailService } from 'src/email/email.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateNewslettersDto } from './dto/create-newsletters.dto';
import { Promotion } from 'src/promotion/promotion.entity';

@Injectable()
export class NewslettersService {
  private readonly logger = new Logger(NewslettersService.name);

  constructor(
    @InjectRepository(Newsletters)
    private readonly newslettersRepository: Repository<Newsletters>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateNewslettersDto) {
    try {
      // Check if email already exists
      const existingNewsletters = await this.newslettersRepository.findOne({
        where: { email: dto.email },
      });

      if (existingNewsletters) {
        throw new ConflictException(
          'Email is already subscribed to newsletters',
        );
      }

      // Create and save new subscriber
      const newsletters = this.newslettersRepository.create(dto);
      const savedNewsletters =
        await this.newslettersRepository.save(newsletters);

      this.logger.log(`New subscriber added: ${savedNewsletters.email}`);

      return {
        success: true,
        message: 'Successfully subscribed to newsletters',
        data: {
          id: savedNewsletters.id,
          email: savedNewsletters.email,
          fullName: savedNewsletters.fullName,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(
        `Failed to create newsletter subscription: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException(
        'Failed to subscribe to newsletters',
      );
    }
  }

  async sendToSubscriber(
    subscriberId: number,
    promotionId: number,
    locale: string = 'en',
  ): Promise<{ message: string }> {
    try {
      // Get subscriber
      const subscriber = await this.newslettersRepository.findOne({
        where: { id: subscriberId },
      });

      if (!subscriber) {
        throw new NotFoundException(
          `Newsletter subscriber with ID ${subscriberId} not found`,
        );
      }

      // Get promotion
      const promotion = await this.promotionRepository.findOne({
        where: { id: promotionId },
      });

      if (!promotion) {
        throw new NotFoundException(
          `Promotion with ID ${promotionId} not found`,
        );
      }

      await this.emailService.sendNewsletters(subscriber, promotion, locale);

      this.logger.log(
        `Newsletter sent successfully to: ${subscriber.email} (promotion: ${promotionId}, locale: ${locale})`,
      );

      const message =
        locale === 'vi'
          ? `Đã gửi tin tức đến ${subscriber.email} thành công`
          : `Newsletter sent to ${subscriber.email} successfully`;

      return { message };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to send newsletter to subscriber ${subscriberId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException('Failed to send newsletter');
    }
  }

  async sendToAllSubscribers(
    promotionId: number,
    locale: string = 'en',
  ): Promise<{
    totalSent: number;
    totalFailed: number;
    details: string[];
  }> {
    try {
      const subscribers = await this.newslettersRepository.find();

      if (subscribers.length === 0) {
        this.logger.warn('No subscribers found');
        return {
          totalSent: 0,
          totalFailed: 0,
          details: ['No subscribers found'],
        };
      }

      // Get promotion
      const promotion = await this.promotionRepository.findOne({
        where: { id: promotionId },
      });

      if (!promotion) {
        throw new NotFoundException(
          `Promotion with ID ${promotionId} not found`,
        );
      }

      let totalSent = 0;
      let totalFailed = 0;
      const details: string[] = [];

      // Process subscribers in batches to avoid overwhelming the email service
      const batchSize = 10;
      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);

        await Promise.allSettled(
          batch.map(async (subscriber) => {
            try {
              await this.emailService.sendNewsletters(
                subscriber,
                promotion,
                locale,
              );
              totalSent++;
              this.logger.log(
                `Newsletter sent to: ${subscriber.email} (promotion: ${promotionId}, locale: ${locale})`,
              );
            } catch (error) {
              totalFailed++;
              const errorMsg = `Failed to send to ${subscriber.email}: ${error instanceof Error ? error.message : String(error)}`;
              this.logger.error(errorMsg);
              details.push(errorMsg);
            }
          }),
        );

        // Add delay between batches to prevent rate limiting
        if (i + batchSize < subscribers.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      this.logger.log(
        `Newsletter campaign completed: ${totalSent} sent, ${totalFailed} failed (promotion: ${promotionId}, locale: ${locale})`,
      );

      return {
        totalSent,
        totalFailed,
        details:
          totalFailed > 0
            ? details
            : [`Successfully sent to ${totalSent} subscribers`],
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to send newsletters to all subscribers: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException('Failed to send newsletters');
    }
  }

  async getAllSubscribers() {
    try {
      const subscribers = await this.newslettersRepository.find({
        select: ['id', 'email', 'fullName', 'phone', 'createdAt'],
        order: { createdAt: 'DESC' },
      });

      return {
        success: true,
        count: subscribers.length,
        data: subscribers,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get subscribers: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException('Failed to retrieve subscribers');
    }
  }

  async deleteSubscriber(subscriberId: number): Promise<{ message: string }> {
    try {
      const subscriber = await this.newslettersRepository.findOne({
        where: { id: subscriberId },
      });

      if (!subscriber) {
        throw new NotFoundException(
          `Newsletter subscriber with ID ${subscriberId} not found`,
        );
      }

      await this.newslettersRepository.delete(subscriberId);

      this.logger.log(
        `Subscriber deleted: ${subscriber.email} (ID: ${subscriberId})`,
      );

      return {
        message: `Subscriber ${subscriber.email} has been successfully deleted`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete subscriber ${subscriberId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException('Failed to delete subscriber');
    }
  }
}
