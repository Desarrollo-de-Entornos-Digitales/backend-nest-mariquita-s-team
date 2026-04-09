import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

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
  findAll() {
    return this.userService.findAll();
  }

  // READ ONE
  @Get(':id')
  findOne(@Param() params: GetUserParamsDto) {
    return this.userService.findOne(params.id);
  }

  // UPDATE
  @Patch(':id')
  update(
    @Param() params: GetUserParamsDto,
    @Body() data: UpdateUserDto,
  ) {
    return this.userService.update(params.id, data);
  }

  // DELETE
  @Delete(':id')
  remove(@Param() params: GetUserParamsDto) {
    return this.userService.remove(params.id);
  }
}
