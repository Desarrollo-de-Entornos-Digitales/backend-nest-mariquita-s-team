import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { AuthService } from './auth.service';
import type { AuthLoginResponse, AuthLogoutResponse } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: UserLoginDto): Promise<AuthLoginResponse> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('auth:logout')
  logout(): AuthLogoutResponse {
    return this.authService.logout();
  }
}
