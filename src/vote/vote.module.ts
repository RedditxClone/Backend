import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { VoteSchema } from './vote.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Vote',
        schema: VoteSchema,
      },
    ]),
  ],
})
export class VoteModule {}
