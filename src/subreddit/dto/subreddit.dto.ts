import type { FlairDto } from './flair.dto';

export class SubredditDto {
  name: string;

  type: string;

  usersPermissions: number;

  acceptPostingRequests: boolean;

  allowPostCrosspost: boolean;

  collapseDeletedComments: boolean;

  commentScoreHideMins: number;

  archivePosts: boolean;

  allowMultipleImages: boolean;

  spoilersEnabled: boolean;

  suggestedCommentSort: string;

  acceptFollowers: boolean;

  over18: boolean;

  description: string;

  allowImages: boolean;

  allowVideos: boolean;

  acceptingRequestsToJoin: boolean;

  communityTopics: string[];

  requirePostFlair: boolean;

  postTextBodyRule: number;

  restrictPostTitleLength: boolean;

  banPostBodyWords: boolean;

  postBodyBannedWords: string[];

  banPostTitleWords: boolean;

  postTitleBannedWords: string[];

  requireWordsInPostTitle: boolean;

  postGuidelines: string;

  welcomeMessageEnabled: boolean;

  welcomeMessageText: string;

  flairList: FlairDto[];

  icon: string;
}
