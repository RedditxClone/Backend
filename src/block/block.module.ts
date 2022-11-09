import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlockSchema } from './block.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Block', schema: BlockSchema }]),
  ],
  providers: [BlockService],
  exports: [BlockService],
})
export class BlockModule {}
