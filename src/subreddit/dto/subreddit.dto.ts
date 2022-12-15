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

  subTopics: string[];

  activeTopic: string;

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

  icon: string;

  categories: string[];

  createdDate: Date;

  notificationType: number;

  title: string;
}
