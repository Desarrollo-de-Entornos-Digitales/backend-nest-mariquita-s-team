import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { NotificationsService } from './notifications.service';

interface RequestWithUser {
  user?: {
    id?: number;
  };
}

@Controller('notifications')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Permissions('notification:read')
  list(@Req() request: RequestWithUser) {
    const userId = request.user?.id ?? 0;
    return this.notificationsService.listForUser(userId);
  }

  @Patch(':id/read')
  @Permissions('notification:update')
  markRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: RequestWithUser,
  ) {
    const userId = request.user?.id ?? 0;
    return this.notificationsService.markRead(userId, id);
  }

  @Post('read-all')
  @Permissions('notification:update')
  markAllRead(@Req() request: RequestWithUser) {
    const userId = request.user?.id ?? 0;
    return this.notificationsService.markAllRead(userId);
  }
}

