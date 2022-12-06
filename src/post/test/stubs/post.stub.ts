import { Types } from 'mongoose';

export const stubPost = (): any => ({
  text: 'Hello World',
  upvotesCount: 0,
  downvotesCount: 0,
  parentId: null,
  userId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
  images: [],
  commentCount: 0,
  insightsCount: 0,
  flair: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
  subredditId: new Types.ObjectId('6363fba4ab2c2f94f3ac9f37'),
  title: 'post1',
  type: 'Post',
});
