import { Type } from 'class-transformer';
import { IsInt, IsString, MaxLength, Min } from 'class-validator';

export class CreateMessageDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  chatId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  senderId: number;

  @IsString()
  @MaxLength(2000)
  content: string;
}
