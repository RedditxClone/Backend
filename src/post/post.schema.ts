import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { PostComment } from '../post-comment/post-comment.schema';

export type PostDocument = Post & Document;

@Schema({ discriminatorKey: 'kind' })
export class Post extends PostComment {
  @Prop()
  images: string[];

  @Prop({ default: 0 })
  commentCount: number;

  @Prop({ default: 0 })
  insightsCount: number;

  @Prop()
  flair: string;

  // for post schedule
  @Prop()
  publishedDate: Date;

  @Prop({ ref: 'Subreddit' })
  subredditId: Types.ObjectId;
}
export const PostSchema = SchemaFactory.createForClass(Post);
