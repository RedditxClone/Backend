import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;
@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;
  @Prop({
    required: true,
  })
  email: string;
  @Prop({ required: true })
  hashPassword: string;
  // default value and enum values will be added
  @Prop({ enum: ['hot', 'new', 'top', 'rising'], default: 'hot' })
  suggestedSort: string;
  // moderator access is given to specific users
  @Prop({ enum: ['user', 'admin', 'moderator'], default: 'user' })
  authType: string;
  //Account
  @Prop({ required: false })
  countryCode: string;
  @Prop({ enum: [`male`, `female`] })
  gender: string;
  //profile
  @Prop()
  displayName: string;
  @Prop()
  about: string;
  @Prop()
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
  //notifications
  @Prop({ default: true })
  inboxMessages: boolean;
  @Prop({ default: true })
  mentions: boolean;
  @Prop({ default: true })
  commentsOnPost: boolean;
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
  //messages
  @Prop({ enum: [`everyone`, `whitelisted`], default: 'everyone' })
  acceptPms: string;
}

export const UserSchema = (() => {
  const schema = SchemaFactory.createForClass(User);
  schema.post('save', (doc: UserDocument, next: () => void) => {
    doc.hashPassword = undefined;
    next();
  });
  return schema;
})();
