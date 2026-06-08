import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserParamsDto } from './dto/get-user-params.dto';

interface RequestWithUser {
  user?: {
    id?: number;
    role?: {
      rolePermissions?: Array<{
        permission?: {
          name?: string;
        };
      }>;
    };
  };
}

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
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param() params: GetUserParamsDto, @Req() request: RequestWithUser) {
    const authUserId = request.user?.id;
    if (!authUserId) {
      throw new ForbiddenException('No autorizado');
    }

    const isSelfRead = authUserId === params.id;
    const permissions =
      request.user?.role?.rolePermissions
        ?.map((rolePermission) => rolePermission.permission?.name)
        .filter(
          (permissionName): permissionName is string => !!permissionName,
        ) ?? [];
    const canReadAnyUser = permissions.includes('user:read');

    if (!isSelfRead && !canReadAnyUser) {
      throw new ForbiddenException(
        'No tienes permisos para ver este usuario',
      );
    }

    return this.userService.findOne(params.id);
  }

  // UPDATE
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param() params: GetUserParamsDto,
    @Body() data: UpdateUserDto,
    @Req() request: RequestWithUser,
  ) {
    const authUserId = request.user?.id;
    if (!authUserId) {
      throw new ForbiddenException('No autorizado');
    }

    const isSelfUpdate = authUserId === params.id;
    const permissions =
      request.user?.role?.rolePermissions
        ?.map((rolePermission) => rolePermission.permission?.name)
        .filter(
          (permissionName): permissionName is string => !!permissionName,
        ) ?? [];
    const canUpdateAnyUser = permissions.includes('user:update');

    if (!isSelfUpdate && !canUpdateAnyUser) {
      throw new ForbiddenException(
        'No tienes permisos para actualizar este usuario',
      );
    }

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
