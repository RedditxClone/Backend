import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';

import type { Vote, VoteWithId } from './vote.schema';

@Injectable()
export class VoteService {
  constructor(@InjectModel('Vote') private readonly voteModel: Model<Vote>) {}

  async vote(
    user: Types.ObjectId,
    thing: Types.ObjectId,
  ): Promise<VoteWithId> | never {
    const res: VoteWithId = await this.voteModel.create({
      user,
      thing,
    });

    return res;
  }
}
