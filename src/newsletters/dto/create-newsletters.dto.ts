import { IsOptional, IsString } from 'class-validator';

export class CreateNewslettersDto {
  @IsString()
  @IsOptional()
  fullName: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  content: string;
}
