class Rules {
  title: string;
  appliedTo: string;
  reportReason?: string;
  description?: string;
}
class RemovalReasons {
  title: string;
  description: string;
}

export class CreateSubredditDto {
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
  rules: Rules[];
  removalReasons: RemovalReasons[];
  welcomeMessageEnabled: boolean;
  welcomeMessageText: string;
}
