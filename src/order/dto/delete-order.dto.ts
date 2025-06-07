import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class DeleteOrderDto {
  @IsNumber()
  @IsNotEmpty()
  orderId: number;
}

export class DeleteOrderByCodeDto {
  @IsString()
  @IsNotEmpty()
  orderCode: string;
}

export class CancelOrderDto {
  @IsString()
  @IsNotEmpty()
  orderCode: string;
}
