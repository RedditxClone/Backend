import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { Vote } from './vote.schema';
/**
 * Vote service for the vote module
 */
@Injectable()
export class VoteService {
  /**
   * class constructor
   * @param voteModel mongoose model
   */
  constructor(@InjectModel('Vote') private readonly voteModel: Model<Vote>) {}
}
