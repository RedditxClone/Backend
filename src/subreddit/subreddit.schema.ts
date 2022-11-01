import { Prop, Schema } from '@nestjs/mongoose';

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

  @Prop()
  rules: [
    {
      title: string;
      appliedTo: string;
      reportReason?: string;
      description?: string;
    },
  ];

  @Prop()
  removalReasons: [
    {
      title: string;
      description: string;
    },
  ];

  @Prop({ default: '' })
  postGuidelines: string;

  @Prop({ default: false })
  welcomeMessageEnabled: boolean;

  @Prop()
  welcomeMessageText: string;
}
