import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

@Exclude()
export class PrefsDto {
  //Account
  @IsOptional()
  @Expose()
  @ApiProperty({ description: "Users's Cover photo location" })
  @IsString()
  @IsUrl()
  coverPhoto?: string;

  @IsOptional()
  @Expose()
  @ApiProperty({ description: "Users's profile photo location" })
  @IsString()
  @IsUrl()
  profilePhoto?: string;

  @IsOptional()
  @Expose()
  @ApiProperty({ description: 'Country Code ex: eg for Egypt' })
  @IsString()
  countryCode?: string;

  @IsOptional()
  @Expose()
  @ApiProperty({ description: 'gender male or female' })
  @IsString()
  @IsIn(['male', 'female'])
  gender?: string;

  @IsOptional()
  @Expose()
  //profile
  @ApiProperty({ description: 'display name of user' })
  @IsString()
  @IsDefined()
  displayName?: string;

  @IsOptional()
  @Expose()
  @ApiProperty({ description: "user's about" })
  @IsString()
  about?: string;

  @IsOptional()
  @Expose()
  @ApiProperty({ description: 'social links like twitter' })
  @IsString({ each: true })
  socialLinks?: string[];

  @IsOptional()
  @Expose()
  @ApiProperty({
    description:
      'This content is NSFW (may contain nudity, pornography, profanity or inappropriate content for those under 18)',
  })
  @IsBoolean()
  nsfw?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description:
      'Followers will be notified about posts you make to your profile and see them in their home feed.',
  })
  @IsBoolean()
  allowFollow?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `Posts to this profile can appear in r/all and your profile can be discovered in /users`,
  })
  @IsBoolean()
  contentVisibility?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: 'Show which communities I am active in on my profile.',
  })
  @IsBoolean()
  activeInCommunitiesVisibility?: boolean;

  @IsOptional()
  @Expose()
  //safety
  @ApiProperty({
    description: `comment collapse value in: [\`off\`, \`low\`, \`medium\`, \`high\`], default is \`off\``,
  })
  @IsString()
  @IsIn([`off`, `low`, `medium`, `high`])
  badCommentAutoCollapse?: string;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `Allow search engines like Google to link to your profile in their search results.`,
  })
  @IsBoolean()
  showInSearch?: boolean;

  @IsOptional()
  @Expose()
  //feed
  @ApiProperty({
    description: `Enable to view adult and NSFW (not safe for work) content in your feed and search results.`,
  })
  @IsBoolean()
  adultContent?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `Play videos and gifs automatically when in the viewport.`,
  })
  @IsBoolean()
  autoPlayMedia?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `comment collapse value in: [\`hot\`, \`new\`, \`top\`, \`rising\`], default is \`hot\``,
  })
  @IsIn([`hot`, `new`, `top`, `rising`])
  @IsString()
  suggestedSort?: string;

  @IsOptional()
  @Expose()
  @IsBoolean()
  @ApiProperty({
    description:
      'Allow us to use the links to other sites you click on for operational purposes' +
      '(that help us better understand how you and others use Reddit) ' +
      'and to show you better ads and recommendations.',
  })
  personalizeAllOfReddit?: boolean;

  @IsOptional()
  @Expose()
  @IsBoolean()
  @ApiProperty({
    description: `Allow us to use information that our advertising partners send us to show you better ads.`,
  })
  personalizeAdsInformation?: boolean;

  @IsOptional()
  @Expose()
  @IsBoolean()
  @ApiProperty({
    description: `Allow us to use your interactions with sites and apps we partner with to show you better ads.`,
  })
  personalizeAdsYourActivity?: boolean;

  @IsOptional()
  @Expose()
  @IsBoolean()
  @ApiProperty({
    description: `Allow us to use your city, state, or country (based on your IP) to recommend better posts and communities.`,
  })
  personalizeRecGeneralLocation?: boolean;

  @IsOptional()
  @Expose()
  @IsBoolean()
  @ApiProperty({
    description: `Allow us to use your interactions with sites and apps we partner with to recommend better posts and communities.`,
  })
  personalizeRecOurPartners?: boolean;

  @IsOptional()
  @Expose()
  @IsBoolean()
  @ApiProperty({
    description: `Help protect your account (even if someone gets your password) by requiring a verification code and a password to log in.`,
  })
  useTwoFactorAuthentication?: boolean;

  //notifications
  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `notify on inbox message`,
  })
  @IsBoolean()
  inboxMessages?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `notify on mention`,
  })
  @IsBoolean()
  mentions?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `notify on comment on post`,
  })
  @IsBoolean()
  commentsOnPost?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `notify on post upvote`,
  })
  @IsBoolean()
  upvotePosts?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `notify on comment upvote`,
  })
  @IsBoolean()
  upvoteComments?: boolean;

  @IsOptional()
  @Expose()
  @IsBoolean()
  @ApiProperty({
    description: `notify on reply comment`,
  })
  repliesComments?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `notify on activity on your comment`,
  })
  @IsBoolean()
  activityComments?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `notify on activity on your thread`,
  })
  @IsBoolean()
  activityOnThreads?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `notify on new followers`,
  })
  @IsBoolean()
  newFollowers?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `notify on new post flairs`,
  })
  @IsBoolean()
  newPostFlair?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `notify on new user flair`,
  })
  @IsBoolean()
  newUserFlair?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `notify on pinned posts`,
  })
  @IsBoolean()
  pinnedPosts?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `notify on posts you follow`,
  })
  @IsBoolean()
  postsYouFollow?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `notify on comments you follow`,
  })
  @IsBoolean()
  commentsYouFollow?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `notify on reddit announcement`,
  })
  @IsBoolean()
  redditAnnouncements?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: `notify on your cake day`,
  })
  @IsBoolean()
  cakeDay?: boolean;

  @IsOptional()
  @Expose()
  //messages
  @ApiProperty({
    description: `accept private messages either \`everyone\` or \`whitelisted\``,
  })
  @IsString()
  @IsIn(['everyone', 'whitelisted'])
  acceptPms?: string;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: 'List of users allowed to private message the user',
  })
  @IsString({ each: true })
  whitelisted?: string[];

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: 'Is the account deleted',
  })
  @IsBoolean()
  accountClosed?: boolean;

  // Miscellaneous
  @IsOptional()
  @Expose()
  @ApiProperty({
    description: 'Enable safe browsing mode',
  })
  @IsBoolean()
  safeBrowsingMode?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({
    description: 'Enable chat requests',
  })
  @IsBoolean()
  chatRequest?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({})
  @IsBoolean()
  newFollower?: boolean;

  @IsOptional()
  @Expose()
  @ApiProperty({})
  @IsBoolean()
  unSubscribe?: boolean;
}
