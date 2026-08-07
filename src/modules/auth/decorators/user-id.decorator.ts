import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Usuario } from '../interfaces/auth.interfaces';
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest<{ user: Usuario }>();
    return request.user?.idusuario;
  },
);
