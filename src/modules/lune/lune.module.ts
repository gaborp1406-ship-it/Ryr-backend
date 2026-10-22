
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LuneController } from './lune.controller';
import { LuneService } from './lune.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([], 'secundaria'),
  ],
  controllers: [LuneController],
  providers: [LuneService],
})
export class LuneModule {}
