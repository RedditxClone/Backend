import { Types } from 'mongoose';

export const stubComment = (): any => ({
  text: 'Hello World',
  upvotesCount: 0,
  downvotesCount: 0,
  parentId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
  userId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
  postId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
  type: 'Comment',
});
