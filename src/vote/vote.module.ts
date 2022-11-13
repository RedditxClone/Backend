import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { VoteController } from './vote.controller';
import { VoteSchema } from './vote.schema';
import { VoteService } from './vote.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Vote',
        schema: VoteSchema,
      },
    ]),
  ],
  controllers: [VoteController],
  providers: [VoteService],
})
export class VoteModule {}
