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

  @Prop({ ref: 'Flair', required: false, default: [] })
  flairs: Types.ObjectId[];

  // for post schedule
  @Prop({ default: Date.now })
  publishedDate: Date;

  @Prop({ ref: 'Subreddit', required: true })
  subredditId: Types.ObjectId;

  @Prop({ required: true })
  title: string;
}
export const PostSchema = SchemaFactory.createForClass(Post);
