import { Module } from '@nestjs/common';
import { AmdService } from './amd.service';

@Module({
  providers: [AmdService],
  exports: [AmdService],
})
export class AmdModule {}
