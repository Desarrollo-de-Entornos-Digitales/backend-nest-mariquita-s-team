import { IsEmail, IsOptional, IsString, MinLength, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
  @IsOptional()
  @IsString()
  bio?: string;

  @IsInt()
  roleId: number;
}
