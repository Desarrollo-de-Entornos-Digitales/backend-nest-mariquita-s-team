import { Body, Controller, Post } from '@nestjs/common';
import { AuthLoginResponse, AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: UserLoginDto): Promise<AuthLoginResponse> {
    return this.authService.login(loginDto);
  }
}
