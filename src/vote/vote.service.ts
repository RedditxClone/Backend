import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { Vote } from './vote.schema';

@Injectable()
export class VoteService {
  constructor(@InjectModel('Vote') private readonly voteModel: Model<Vote>) {}
}
