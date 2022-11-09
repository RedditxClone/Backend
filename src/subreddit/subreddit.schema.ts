import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as schemaType } from 'mongoose';

class Flair {
  @Prop({ required: true })
  text: string;
  @Prop({ auto: true, required: true })
  _id: schemaType.Types.ObjectId;
  @Prop()
  backgroundColor: string;
  @Prop({ required: true })
  textColor: string;
}
@Schema()
export class Subreddit {
  @Prop({
    required: true,
    unique: true,
    maxlength: 21,
  })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop({ default: 0 })
  usersPermissions: number;

  @Prop({ default: false })
  acceptPostingRequests: boolean;

  @Prop({ default: true })
  allowPostCrosspost: boolean;

  @Prop({ default: false })
  collapseDeletedComments: boolean;

  @Prop({ default: 0 })
  commentScoreHideMins: number;

  @Prop({ default: false })
  archivePosts: boolean;

  @Prop({ default: true })
  allowMultipleImages: boolean;

  @Prop({ default: true })
  spoilersEnabled: boolean;

  @Prop({ default: 'None' })
  suggestedCommentSort: string;

  @Prop({ required: true, default: true })
  acceptFollowers: boolean;

  @Prop({ required: true })
  over18: boolean;

  @Prop({ maxlength: 500 })
  description: string;

  @Prop({ default: true })
  allowImages: boolean;

  @Prop({ default: true })
  allowVideos: boolean;

  @Prop({ default: true })
  acceptingRequestsToJoin: boolean;

  @Prop()
  communityTopics: string[];

  @Prop({ default: false })
  requirePostFlair: boolean;

  @Prop({ default: 0 })
  postTextBodyRule: number;

  @Prop({ default: false })
  restrictPostTitleLength: boolean;

  @Prop({ default: false })
  banPostBodyWords: boolean;

  @Prop()
  postBodyBannedWords: string[];

  @Prop({ default: false })
  banPostTitleWords: boolean;

  @Prop()
  postTitleBannedWords: string[];

  @Prop({ default: false })
  requireWordsInPostTitle: boolean;

  @Prop({ default: '' })
  postGuidelines: string;

  @Prop({ default: false })
  welcomeMessageEnabled: boolean;

  @Prop()
  welcomeMessageText: string;

  @Prop({ default: [] })
  flairList: Flair[];
  @Prop()
  icon: string;
}

export const SubredditSchema = SchemaFactory.createForClass(Subreddit);

export type SubredditDocument = Subreddit & Document;
