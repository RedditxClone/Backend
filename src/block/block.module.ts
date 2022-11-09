import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlockSchema } from './block.schema';
import { BlockService } from './block.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Block', schema: BlockSchema }]),
  ],
  providers: [BlockService],
  exports: [BlockService],
})
export class BlockModule {}
