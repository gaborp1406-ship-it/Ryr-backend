import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrabajadorModule } from './modules/trabajador/trabajador.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { AuthModule } from './modules/auth/auth.module';
import { OpcionesModule } from './modules/opciones/opciones.module';
import { ProyectosModule } from './modules/proyectos/proyectos.module';
import { AsesoresModule } from './modules/asesores/asesores.module';
import { LeadsModule } from './modules/leads/leads.module';
import { AsteriskModule } from './modules/asterisk/asterisk.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432'),
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      ssl:
        process.env.DB_SSLMODE === 'require'
          ? { rejectUnauthorized: false }
          : false,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TrabajadorModule,
    UsuarioModule,
    AuthModule,
    ProyectosModule,

    AsesoresModule,
    LeadsModule,
    AsteriskModule,
    OpcionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
