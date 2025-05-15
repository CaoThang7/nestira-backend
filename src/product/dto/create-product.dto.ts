import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  IsArray,
} from 'class-validator';

export class CreateProductDto {
  @IsObject()
  @IsNotEmpty()
  name: {
    vi: string;
    en: string;
  };

  @IsOptional()
  @IsObject()
  description?: {
    vi?: string;
    en?: string;
  };

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @IsArray()
  @IsOptional()
  imageUrls: string[];

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  productCode?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsObject()
  origin?: {
    vi?: string;
    en?: string;
  };

  @IsOptional()
  @IsObject()
  material?: {
    vi?: string;
    en?: string;
  };

  @IsOptional()
  specifications?: {
    vi?: any;
    en?: any;
  };
}
