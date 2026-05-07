import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface RequestWithUser {
  user?: {
    role?: {
      rolePermissions?: Array<{
        permission?: {
          name?: string;
        };
      }>;
    };
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userPermissions =
      request.user?.role?.rolePermissions
        ?.map((rolePermission) => rolePermission.permission?.name)
        .filter(
          (permissionName): permissionName is string => !!permissionName,
        ) ?? [];

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
