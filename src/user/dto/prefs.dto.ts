import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsIn,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';

@Exclude()
export class PrefsDto {
  //Account
  @ValidateIf((o) => o.coverPhoto !== undefined)
  @Expose()
  @ApiProperty({ description: "Users's Cover photo location" })
  @IsString()
  @IsUrl()
  coverPhoto?: string;

  @ValidateIf((o) => o.profilePhoto !== undefined)
  @Expose()
  @ApiProperty({ description: "Users's profile photo location" })
  @IsString()
  @IsUrl()
  profilePhoto?: string;

  @ValidateIf((o) => o.countryCode !== undefined)
  @Expose()
  @ApiProperty({ description: 'Country Code ex: eg for Egypt' })
  @IsString()
  countryCode?: string;

  @ValidateIf((o) => o.gender !== undefined)
  @Expose()
  @ApiProperty({ description: 'gender male or female' })
  @IsString()
  @IsIn(['male', 'female'])
  gender?: string;

  @Expose()
  //profile
  @ApiProperty({ description: 'display name of user' })
  @IsString()
  @IsDefined()
  @ValidateIf((o) => o.displayName !== undefined)
  displayName?: string;

  @ValidateIf((o) => o.about !== undefined)
  @Expose()
  @ApiProperty({ description: "user's about" })
  @IsString()
  about?: string;

  @ValidateIf((o) => o.socialLinks !== undefined)
  @Expose()
  @ApiProperty({ description: 'social links like twitter' })
  @IsString({ each: true })
  socialLinks?: string[];

  @ValidateIf((o) => o.nsfw !== undefined)
  @Expose()
  @ApiProperty({
    description:
      'This content is NSFW (may contain nudity, pornography, profanity or inappropriate content for those under 18)',
  })
  @IsBoolean()
  nsfw?: boolean;

  @ValidateIf((o) => o.allowFollow !== undefined)
  @Expose()
  @ApiProperty({
    description:
      'Followers will be notified about posts you make to your profile and see them in their home feed.',
  })
  @IsBoolean()
  allowFollow?: boolean;

  @ValidateIf((o) => o.contentVisibility !== undefined)
  @Expose()
  @ApiProperty({
    description: `Posts to this profile can appear in r/all and your profile can be discovered in /users`,
  })
  @IsBoolean()
  contentVisibility?: boolean;

  @ValidateIf((o) => o.activeInCommunitiesVisibility !== undefined)
  @Expose()
  @ApiProperty({
    description: 'Show which communities I am active in on my profile.',
  })
  @IsBoolean()
  activeInCommunitiesVisibility?: boolean;

  @ValidateIf((o) => o.badCommentAutoCollapse !== undefined)
  @Expose()
  //safety
  @ApiProperty({
    description: `comment collapse value in: [\`off\`, \`low\`, \`medium\`, \`high\`], default is \`off\``,
  })
  @IsString()
  @IsIn([`off`, `low`, `medium`, `high`])
  badCommentAutoCollapse?: string;

  @ValidateIf((o) => o.showInSearch !== undefined)
  @Expose()
  @ApiProperty({
    description: `Allow search engines like Google to link to your profile in their search results.`,
  })
  @IsBoolean()
  showInSearch?: boolean;

  @ValidateIf((o) => o.adultContent !== undefined)
  @Expose()
  //feed
  @ApiProperty({
    description: `Enable to view adult and NSFW (not safe for work) content in your feed and search results.`,
  })
  @IsBoolean()
  adultContent?: boolean;

  @ValidateIf((o) => o.autoPlayMedia !== undefined)
  @Expose()
  @ApiProperty({
    description: `Play videos and gifs automatically when in the viewport.`,
  })
  @IsBoolean()
  autoPlayMedia?: boolean;

  @ValidateIf((o) => o.suggestedSort !== undefined)
  @Expose()
  @ApiProperty({
    description: `comment collapse value in: [\`hot\`, \`new\`, \`top\`, \`rising\`], default is \`hot\``,
  })
  @IsIn([`hot`, `new`, `top`, `rising`])
  @IsString()
  suggestedSort?: string;

  @ValidateIf((o) => o.personalizeAllOfReddit !== undefined)
  @Expose()
  @IsBoolean()
  @ApiProperty({
    description:
      'Allow us to use the links to other sites you click on for operational purposes' +
      '(that help us better understand how you and others use Reddit) ' +
      'and to show you better ads and recommendations.',
  })
  personalizeAllOfReddit?: boolean;

  @ValidateIf((o) => o.personalizeAdsInformation !== undefined)
  @Expose()
  @IsBoolean()
  @ApiProperty({
    description: `Allow us to use information that our advertising partners send us to show you better ads.`,
  })
  personalizeAdsInformation?: boolean;

  @ValidateIf((o) => o.personalizeAdsYourActivity !== undefined)
  @Expose()
  @IsBoolean()
  @ApiProperty({
    description: `Allow us to use your interactions with sites and apps we partner with to show you better ads.`,
  })
  personalizeAdsYourActivity?: boolean;

  @ValidateIf((o) => o.personalizeRecGeneralLocation !== undefined)
  @Expose()
  @IsBoolean()
  @ApiProperty({
    description: `Allow us to use your city, state, or country (based on your IP) to recommend better posts and communities.`,
  })
  personalizeRecGeneralLocation?: boolean;

  @ValidateIf((o) => o.personalizeRecOurPartners !== undefined)
  @Expose()
  @IsBoolean()
  @ApiProperty({
    description: `Allow us to use your interactions with sites and apps we partner with to recommend better posts and communities.`,
  })
  personalizeRecOurPartners?: boolean;

  @ValidateIf((o) => o.useTwoFactorAuthentication !== undefined)
  @Expose()
  @IsBoolean()
  @ApiProperty({
    description: `Help protect your account (even if someone gets your password) by requiring a verification code and a password to log in.`,
  })
  useTwoFactorAuthentication?: boolean;

  //notifications
  @ValidateIf((o) => o.inboxMessages !== undefined)
  @Expose()
  @ApiProperty({
    description: `notify on inbox message`,
  })
  @IsBoolean()
  inboxMessages?: boolean;

  @ValidateIf((o) => o.mentions !== undefined)
  @Expose()
  @ApiProperty({
    description: `notify on mention`,
  })
  @IsBoolean()
  mentions?: boolean;

  @ValidateIf((o) => o.commentsOnPost !== undefined)
  @Expose()
  @ApiProperty({
    description: `notify on comment on post`,
  })
  @IsBoolean()
  commentsOnPost?: boolean;

  @ValidateIf((o) => o.upvotePosts !== undefined)
  @Expose()
  @ApiProperty({
    description: `notify on post upvote`,
  })
  @IsBoolean()
  upvotePosts?: boolean;

  @ValidateIf((o) => o.upvoteComments !== undefined)
  @Expose()
  @ApiProperty({
    description: `notify on comment upvote`,
  })
  @IsBoolean()
  upvoteComments?: boolean;

  @ValidateIf((o) => o.repliesComments !== undefined)
  @Expose()
  @IsBoolean()
  @ApiProperty({
    description: `notify on reply comment`,
  })
  repliesComments?: boolean;

  @ValidateIf((o) => o.activityComments !== undefined)
  @Expose()
  @ApiProperty({
    description: `notify on activity on your comment`,
  })
  @IsBoolean()
  activityComments?: boolean;

  @ValidateIf((o) => o.activityOnThreads !== undefined)
  @Expose()
  @ApiProperty({
    description: `notify on activity on your thread`,
  })
  @IsBoolean()
  activityOnThreads?: boolean;

  @ValidateIf((o) => o.newFollowers !== undefined)
  @Expose()
  @ApiProperty({
    description: `notify on new followers`,
  })
  @IsBoolean()
  newFollowers?: boolean;

  @ValidateIf((o) => o.newPostFlair !== undefined)
  @Expose()
  @ApiProperty({
    description: `notify on new post flairs`,
  })
  @IsBoolean()
  newPostFlair?: boolean;

  @ValidateIf((o) => o.newUserFlair !== undefined)
  @Expose()
  @ApiProperty({
    description: `notify on new user flair`,
  })
  @IsBoolean()
  newUserFlair?: boolean;

  @ValidateIf((o) => o.pinnedPosts !== undefined)
  @Expose()
  @ApiProperty({
    description: `notify on pinned posts`,
  })
  @IsBoolean()
  pinnedPosts?: boolean;

  @ValidateIf((o) => o.postsYouFollow !== undefined)
  @Expose()
  @ApiProperty({
    description: `notify on posts you follow`,
  })
  @IsBoolean()
  postsYouFollow?: boolean;

  @ValidateIf((o) => o.commentsYouFollow !== undefined)
  @Expose()
  @ApiProperty({
    description: `notify on comments you follow`,
  })
  @IsBoolean()
  commentsYouFollow?: boolean;

  @ValidateIf((o) => o.redditAnnouncements !== undefined)
  @Expose()
  @ApiProperty({
    description: `notify on reddit announcement`,
  })
  @IsBoolean()
  redditAnnouncements?: boolean;

  @ValidateIf((o) => o.cakeDay !== undefined)
  @Expose()
  @ApiProperty({
    description: `notify on your cake day`,
  })
  @IsBoolean()
  cakeDay?: boolean;

  @ValidateIf((o) => o.acceptPms !== undefined)
  @Expose()
  //messages
  @ApiProperty({
    description: `accept private messages either \`everyone\` or \`whitelisted\``,
  })
  @IsString()
  @IsIn(['everyone', 'whitelisted'])
  acceptPms?: string;

  @ValidateIf((o) => o.whitelisted !== undefined)
  @Expose()
  @ApiProperty({
    description: 'List of users allowed to private message the user',
  })
  @IsString({ each: true })
  whitelisted?: string[];

  @ValidateIf((o) => o.accountClosed !== undefined)
  @Expose()
  @ApiProperty({
    description: 'Is the account deleted',
  })
  @IsBoolean()
  accountClosed?: boolean;
}
