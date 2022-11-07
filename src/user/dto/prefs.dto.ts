import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsString } from 'class-validator';

export class PrefsDto {
  //Account
  @ApiProperty({ description: 'Country Code ex: eg for Egypt' })
  @IsString()
  countryCode: string;
  @ApiProperty({ description: 'gender male or female' })
  @IsString()
  @IsIn(['male', 'female'])
  gender: string;
  //profile
  @ApiProperty({ description: 'display name of user' })
  @IsString()
  displayName: string;
  @ApiProperty({ description: "user's about" })
  @IsString()
  about: string;
  @ApiProperty({ description: 'social links like twitter' })
  @IsString({ each: true })
  socialLinks: string[];
  @ApiProperty({
    description:
      'This content is NSFW (may contain nudity, pornography, profanity or inappropriate content for those under 18)',
  })
  @IsBoolean()
  nsfw: boolean;
  @ApiProperty({
    description:
      'Followers will be notified about posts you make to your profile and see them in their home feed.',
  })
  @IsBoolean()
  allowFollow: boolean;
  @ApiProperty({
    description: `Posts to this profile can appear in r/all and your profile can be discovered in /users`,
  })
  @IsBoolean()
  contentVisibility: boolean;
  @ApiProperty({
    description: 'Show which communities I am active in on my profile. ',
  })
  @IsBoolean()
  activeInCommunitiesVisibility: boolean;
  //safety
  @ApiProperty({
    description: `comment collapse value in: [\`off\`, \`low\`, \`medium\`, \`high\`], default is \`off\``,
  })
  @IsString()
  @IsIn([`off`, `low`, `medium`, `high`])
  badCommentAutoCollapse: string;
  @ApiProperty({
    description: `Allow search engines like Google to link to your profile in their search results.`,
  })
  @IsBoolean()
  showInSearch: boolean;
  //feed
  @ApiProperty({
    description: `Enable to view adult and NSFW (not safe for work) content in your feed and search results.`,
  })
  @IsBoolean()
  adultContent: boolean;
  @ApiProperty({
    description: `Play videos and gifs automatically when in the viewport.`,
  })
  @IsBoolean()
  autoPlayMedia: boolean;
  @ApiProperty({
    description: `comment collapse value in: [\`hot\`, \`new\`, \`top\`, \`rising\`], default is \`hot\``,
  })
  @IsIn([`hot`, `new`, `top`, `rising`])
  @IsString()
  suggestedSort: string;
  //notifications
  @ApiProperty({
    description: `notify on inbox message`,
  })
  @IsBoolean()
  inboxMessages: boolean;
  @ApiProperty({
    description: `notify on mention`,
  })
  @IsBoolean()
  mentions: boolean;
  @ApiProperty({
    description: `notify on comment on post`,
  })
  @IsBoolean()
  commentsOnPost: boolean;
  @ApiProperty({
    description: `notify on post upvote`,
  })
  @IsBoolean()
  upvotePosts: boolean;
  @ApiProperty({
    description: `notify on comment upvote`,
  })
  @IsBoolean()
  upvoteComments: boolean;
  @ApiProperty({
    description: `notify on reply comment`,
  })
  @IsBoolean()
  repliesComments: boolean;
  @ApiProperty({
    description: `notify on activity on your comment`,
  })
  @IsBoolean()
  activityComments: boolean;
  @ApiProperty({
    description: `notify on activity on your thread`,
  })
  @IsBoolean()
  activityOnThreads: boolean;
  @ApiProperty({
    description: `notify on new followers`,
  })
  @IsBoolean()
  newFollowers: boolean;
  @ApiProperty({
    description: `notify on new post flairs`,
  })
  @IsBoolean()
  newPostFlair: boolean;
  @ApiProperty({
    description: `notify on new user flair`,
  })
  @IsBoolean()
  newUserFlair: boolean;
  @ApiProperty({
    description: `notify on pinned posts`,
  })
  @IsBoolean()
  pinnedPosts: boolean;
  @ApiProperty({
    description: `notify on posts you follow`,
  })
  @IsBoolean()
  postsYouFollow: boolean;
  @ApiProperty({
    description: `notify on comments you follow`,
  })
  @IsBoolean()
  commentsYouFollow: boolean;
  @ApiProperty({
    description: `notify on reddit announcement`,
  })
  @IsBoolean()
  redditAnnouncements: boolean;
  @ApiProperty({
    description: `notify on your cake day`,
  })
  @IsBoolean()
  cakeDay: boolean;
  //messages
  @ApiProperty({
    description: `accept private messages either \`everyone\` or \`whitelisted\``,
  })
  @IsString()
  @IsIn(['everyone', 'whitelisted'])
  acceptPms: string;
  @ApiProperty({
    description: 'List of users allowed to private message the user',
  })
  @IsString({ each: true })
  whitelisted: string[];
}
