import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('registrar')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.registrarUsuario(createUsuarioDto);
  }



}
