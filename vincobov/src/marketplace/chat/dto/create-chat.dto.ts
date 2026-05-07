import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CreateChatDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sellerId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  buyerId: number;
}
