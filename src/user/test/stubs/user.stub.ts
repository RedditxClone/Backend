import { User } from '../../../user/user.schema';

export const stubUser = (): User => {
  return {
    username: 'username',
    email: 'email@example.com',
    hashPassword: 'thisIsHashedPassword',
    suggestedSort: '',
    authType: 'user',
    countryCode: null,
    gender: 'male',
    //profile
    displayName: null,
    about: null,
    socialLinks: [],
    nsfw: true,
    allowFollow: true,
    contentVisibility: true,
    activeInCommunitiesVisibility: true,
    //safety
    badCommentAutoCollapse: 'low',
    showInSearch: true,
    //feed
    adultContent: true,
    autoPlayMedia: true,
    //notifications
    inboxMessages: true,
    mentions: true,
    commentsOnPost: true,
    upvotePosts: true,
    upvoteComments: true,
    repliesComments: true,
    activityComments: true,
    activityOnThreads: true,
    newFollowers: true,
    newPostFlair: true,
    newUserFlair: true,
    pinnedPosts: true,
    postsYouFollow: true,
    commentsYouFollow: true,
    redditAnnouncements: true,
    cakeDay: true,
    //messages
    acceptPms: 'everyone',
    whitelisted: [],
  };
};
