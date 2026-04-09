import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserParamsDto } from './dto/get-user-params.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // CREATE
  @Post()
  create(@Body() data: CreateUserDto) {
    return this.userService.create(data);
  }

  // READ ALL
  @Get()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('user:read')
  findAll() {
    return this.userService.findAll();
  }

  // READ ONE
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('user:read')
  findOne(@Param() params: GetUserParamsDto) {
    return this.userService.findOne(params.id);
  }

  // UPDATE
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('user:update')
  update(@Param() params: GetUserParamsDto, @Body() data: UpdateUserDto) {
    return this.userService.update(params.id, data);
  }

  // DELETE
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('user:delete')
  remove(@Param() params: GetUserParamsDto) {
    return this.userService.remove(params.id);
  }
}
