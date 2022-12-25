// eslint-disable-next-line max-classes-per-file
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';
import { Types } from 'mongoose';

export class Flair {
  @Prop({ required: true })
  text: string;

  @Prop({ auto: true, required: true })
  _id: Types.ObjectId;

  @Prop()
  backgroundColor: string;

  @Prop({ required: true })
  textColor: string;
}

class ApprovedUsers {
  @Prop()
  username: string;

  @Prop()
  date: Date;
}

class MutedUsers {
  @Prop()
  username: string;

  @Prop()
  date: Date;

  @Prop()
  reason?: string;
}

class BannedUsers {
  @Prop()
  username: string;

  @Prop()
  date: Date;

  @Prop()
  reason: string;

  @Prop()
  modNote?: string;

  @Prop()
  permanent?: boolean;

  @Prop()
  duration?: string;

  @Prop()
  message?: string;
}

export class Rule {
  @Prop({ required: true })
  rule: string;

  @Prop({ required: true, enum: [0, 1, 2] })
  to: number;

  @Prop()
  reason?: string;

  @Prop()
  description?: string;

  @Prop({ default: Date.now })
  createdDate?: Date;

  @Prop({ required: true })
  _id: Types.ObjectId;
}

@Schema()
export class Subreddit {
  @Prop({
    required: true,
    unique: true,
    maxlength: 21,
  })
  name: string;

  @Prop()
  title: string;

  @Prop({ required: true })
  type: string;

  @Prop({ default: 0 })
  usersPermissions: number;

  @Prop({ default: true })
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

  @Prop({ default: [] })
  subTopics: string[];

  @Prop({ default: null })
  activeTopic: string;

  @Prop({ default: false })
  requirePostFlair: boolean;

  @Prop({ default: 0 })
  postTextBodyRule: number;

  @Prop({ default: false })
  restrictPostTitleLength: boolean;

  @Prop({ default: false })
  banPostBodyWords: boolean;

  @Prop({ default: [] })
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

  @Prop({ default: [] })
  moderators: string[];

  @Prop({ default: null })
  icon: string;

  @Prop({ default: [] })
  categories: string[];

  @Prop({ default: Date.now })
  createdDate: Date;

  @Prop({ default: [] })
  rules: Rule[];

  @Prop({ default: [] })
  joinList: Types.ObjectId[];

  @Prop({ default: [] })
  bannedUsers: BannedUsers[];

  @Prop({ default: [] })
  mutedUsers: MutedUsers[];

  @Prop({ default: [] })
  approvedUsers: ApprovedUsers[];

  @Prop({ default: 0 })
  notificationType: number;

  @Prop({ default: 1 })
  users: number;
}

export const SubredditSchema = SchemaFactory.createForClass(Subreddit);

export type SubredditDocument = Subreddit & Document;
