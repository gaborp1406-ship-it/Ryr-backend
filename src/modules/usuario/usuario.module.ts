import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsuarioRepository } from './repository/usuario.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: 'AutoNego2026$',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService, UsuarioRepository],
})
export class UsuarioModule {}
