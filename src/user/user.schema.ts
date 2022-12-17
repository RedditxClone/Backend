/* eslint-disable @typescript-eslint/no-floating-promises */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document, Types } from 'mongoose';

export type UserDocument = User & Document;
export type UserWithId = User & { _id: Types.ObjectId };
@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ select: false })
  hashPassword: string;

  @Prop({ default: Date.now() })
  createdAt: Date;

  // moderator access is given to specific users
  @Prop({ enum: ['user', 'admin', 'moderator'], default: 'user' })
  authType: string;

  //Account
  @Prop({ required: false, default: '' })
  profilePhoto: string;

  @Prop({ required: false, default: '' })
  coverPhoto: string;

  @Prop({ required: false, default: '' })
  countryCode: string;

  @Prop({ enum: [`male`, `female`, ``], default: '' })
  gender: string;

  @Prop({ default: false })
  accountClosed: boolean;

  //profile
  @Prop({ default: '' })
  displayName: string;

  @Prop({ default: '' })
  about: string;

  @Prop({ default: [] })
  socialLinks: string[];

  @Prop({ default: false })
  nsfw: boolean;

  @Prop({ default: true })
  allowFollow: boolean;

  @Prop({ default: true })
  contentVisibility: boolean;

  @Prop({ default: true })
  activeInCommunitiesVisibility: boolean;

  //safety
  @Prop({ enum: [`off`, `low`, `medium`, `high`], default: 'off' })
  badCommentAutoCollapse: string;

  @Prop({ default: true })
  showInSearch: boolean;

  //feed
  @Prop({ default: false })
  adultContent: boolean;

  @Prop({ default: true })
  autoPlayMedia: boolean;

  @Prop({ default: true })
  personalizeAllOfReddit: boolean;

  @Prop({ default: true })
  personalizeAdsInformation: boolean;

  @Prop({ default: true })
  personalizeAdsYourActivity: boolean;

  @Prop({ default: true })
  personalizeRecGeneralLocation: boolean;

  @Prop({ default: true })
  personalizeRecOurPartners: boolean;

  @Prop({ default: true })
  useTwoFactorAuthentication: boolean;

  // default value and enum values will be added
  @Prop({ enum: ['hot', 'new', 'top', 'rising'], default: 'hot' })
  suggestedSort: string;

  //notifications
  @Prop({ default: true })
  inboxMessages: boolean;

  @Prop({ default: true })
  mentions: boolean;

  @Prop({ default: true })
  commentsOnPost: boolean;

  @Prop({ default: true })
  upvotePosts: boolean;

  @Prop({ default: true })
  upvoteComments: boolean;

  @Prop({ default: true })
  repliesComments: boolean;

  @Prop({ default: true })
  activityComments: boolean;

  @Prop({ default: true })
  activityOnThreads: boolean;

  @Prop({ default: true })
  newFollowers: boolean;

  @Prop({ default: true })
  newPostFlair: boolean;

  @Prop({ default: true })
  newUserFlair: boolean;

  @Prop({ default: true })
  pinnedPosts: boolean;

  @Prop({ default: true })
  postsYouFollow: boolean;

  @Prop({ default: true })
  commentsYouFollow: boolean;

  @Prop({ default: true })
  redditAnnouncements: boolean;

  @Prop({ default: true })
  cakeDay: boolean;

  @Prop({ default: [] })
  dontNotifyIds: Types.ObjectId[];

  //messages
  @Prop({ enum: [`everyone`, `whitelisted`], default: 'everyone' })
  acceptPms: string;

  @Prop({ default: [] })
  whitelisted: string[];

  @Prop({ default: [] })
  savedPosts: Types.ObjectId[];

  //Miscellaneous
  @Prop({ default: false })
  safeBrowsingMode: boolean;

  @Prop({ default: true })
  chatRequest: boolean;

  @Prop({ default: false })
  newFollower: boolean;

  @Prop({ default: false })
  unSubscribe: boolean;

  // google auth
  @Prop({ unique: true, sparse: true })
  continueWithGoogleAccount?: string;

  // github auth
  @Prop({ unique: true, sparse: true })
  continueWithGithubAccount?: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre(/^find/, function (next) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-invalid-this
  this.where({ accountClosed: { $ne: true } }).select('-__v');

  next();
});
