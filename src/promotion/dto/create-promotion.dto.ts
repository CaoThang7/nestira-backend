import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class CreatePromotionDto {
  @IsObject()
  @IsNotEmpty()
  title: {
    vi: string;
    en: string;
  };

  @IsOptional()
  @IsObject()
  content?: {
    vi?: string;
    en?: string;
  };

  @IsString()
  @IsOptional()
  thumbnail: string;
}
