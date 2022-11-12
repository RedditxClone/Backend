import { Types } from 'mongoose';

export const stubPostComment = (): any => ({
  text: 'Hello World',
  upvotesCount: 0,
  downvotesCount: 0,
  userId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
});
