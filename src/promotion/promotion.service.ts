import { Repository } from 'typeorm';
import { Promotion } from './promotion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
  ) {}

  async create(dto: CreatePromotionDto) {
    const existingPromotion = await this.promotionRepository.findOne({
      where: { title: dto.title },
    });

    if (existingPromotion) {
      throw new ConflictException('Promotion title already exists');
    }

    const promotion = this.promotionRepository.create({ ...dto });

    const savedPromotion = await this.promotionRepository.save(promotion);

    return {
      message: 'Promotion created successfully',
      data: savedPromotion,
    };
  }

  async update(id: number, dto: UpdatePromotionDto) {
    const promotion = await this.promotionRepository.findOne({ where: { id } });
    if (!promotion) throw new NotFoundException(`Promotion ID ${id} not found`);

    if (dto.title) {
      promotion.title = {
        ...promotion.title,
        ...dto.title,
      };
    }

    if (dto.content) {
      promotion.content = {
        ...promotion.content,
        ...dto.content,
      };
    }

    if (dto.thumbnail !== undefined) {
      promotion.thumbnail = dto.thumbnail;
    }

    await this.promotionRepository.save(promotion);
    return { message: 'Promotion updated successfully' };
  }

  async findAll(locale: string = 'en') {
    const promotions = await this.promotionRepository.find();

    const localizedPromotions = promotions.map((promotion) => ({
      id: promotion.id,
      title: (promotion.title?.[locale] as string) ?? '',
      content: (promotion.content?.[locale] as string) ?? '',
      thumbnail: promotion.thumbnail,
      createdAt: promotion.createdAt,
    }));

    return localizedPromotions;
  }

  async findLatest(locale: string = 'en') {
    const promotions = await this.promotionRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 3,
    });

    const localizedPromotions = promotions.map((promotion) => ({
      id: promotion.id,
      title: (promotion.title?.[locale] as string) ?? '',
      content: (promotion.content?.[locale] as string) ?? '',
      thumbnail: promotion.thumbnail,
      createdAt: promotion.createdAt,
    }));

    return localizedPromotions;
  }

  async findOne(id: number, locale: string = 'en') {
    const promotion = await this.promotionRepository.findOne({ where: { id } });

    if (!promotion) {
      throw new NotFoundException(`Promotion ID ${id} not found`);
    }

    return {
      id: promotion.id,
      title: (promotion.title?.[locale] as string) ?? '',
      content: (promotion.content?.[locale] as string) ?? '',
      thumbnail: promotion.thumbnail,
      createdAt: promotion.createdAt,
    };
  }

  async remove(id: number) {
    const promotion = await this.promotionRepository.findOne({ where: { id } });

    if (!promotion) {
      throw new NotFoundException(`Promotion ID ${id} not found`);
    }

    await this.promotionRepository.remove(promotion);

    return { message: 'Promotion deleted successfully' };
  }
}
