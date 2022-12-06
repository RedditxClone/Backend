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

  @Prop({ required: false })
  flair: Types.ObjectId;

  // for post schedule
  @Prop({ default: Date.now })
  publishedDate: Date;

  @Prop({ required: true })
  title: string;

  @Prop({ default: false, required: false })
  nsfw: boolean;

  @Prop({ default: false, required: false })
  spoiler: boolean;
}
export const PostSchema = SchemaFactory.createForClass(Post);
