export class CreateSubredditDto {
  acceptFollowers: boolean;

  allowImages: boolean;

  allowPostCrosspost: boolean;

  allowTop: boolean;

  allowVideos: boolean;

  collapseDeletedComments: boolean;

  commentContributionSettings: string;

  commentScoreHideMins: number;

  description: string;

  disableContributorRequests: boolean;

  headerTitle: string;

  keyColor: string;

  linkType: string;

  name: string;

  originalContentTagEnabled: boolean;

  over18: boolean;

  publicDescription: string;

  restrictCommenting: boolean;

  restrictPosting: boolean;

  shouldArchivePosts: boolean;

  showMedia: boolean;

  showMediaPreview: boolean;

  spamComments: boolean;

  spamPosts: boolean;

  spoilersEnabled: boolean;

  submitLinkLabel: string;

  submitText: string;

  submitLabel: string;

  suggestedCommentSort: string;

  title: string;

  type: string;

  welcomeMessageEnabled: boolean;

  welcomeMessageText: string;
}
