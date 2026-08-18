import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly usuarioService: UsuarioService,
    private readonly configService: ConfigService,
  ) { }
  @Post('login')
  login(@Body() loginUsuarioDto: LoginUsuarioDto) {
    return this.authService.login(loginUsuarioDto);
  }

  @Get('checkstatus')
  checkStatus(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    let payload: { sub: number };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token inválido');
    }

    return this.authService.checkStatus(payload.sub, token);
  }
  @Get('credenciales-sip')
  @UseGuards(JwtAuthGuard)
  async obtenerCredencialesSip(
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    let payload: { sub: number };

    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token inválido');
    }

    const idTrabajador = payload.sub;

    const credenciales =
      await this.usuarioService.obtenerCredencialesSip(idTrabajador);

    if (
      !credenciales ||
      !credenciales.username ||
      !credenciales.password
    ) {
      return {
        success: false,
        message: 'SIP no ha sido configurado',
      };
    }

    return {
      success: true,

      agentExtension: credenciales.extension,

      sipUsername: credenciales.username,

      sipPassword: credenciales.password,

      sipServer: this.configService.get<string>('SIP_SERVER'),

      sipPort: this.configService.get<number>('SIP_PORT'),

      expiresIn: 43200,
    };
  }
}
