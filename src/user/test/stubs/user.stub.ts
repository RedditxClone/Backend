import { fail } from 'assert';
import { User } from '../../../user/user.schema';

export const stubUser = (): User => {
  return {
    username: 'username',
    email: 'email@example.com',
    hashPassword: 'thisIsHashedPassword',
    suggestedSort: '',
    authType: 'user',
    countryCode: '',
    gender: 'male',
    profilePhoto:
      'https://image.shutterstock.com/mosaic_250/2780032/1854697390/stock-photo-head-shot-young-attractive-businessman-in-glasses-standing-in-modern-office-pose-for-camera-1854697390.jpg',
    coverPhoto:
      'https://images.fineartamerica.com/images/artworkimages/mediumlarge/2/1-mcway-waterfall-with-small-cove-ingmar-wesemann.jpg',
    //profile
    displayName: '',
    about: '',
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
    personalizeAllOfReddit: false,
    personalizeAdsInformation: true,
    personalizeAdsYourActivity: false,
    personalizeRecGeneralLocation: true,
    personalizeRecOurPartners: true,
    useTwoFactorAuthentication: false,
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
export const stubUserFresh = (): User => {
  return {
    username: 'username',
    email: 'email@example.com',
    hashPassword: 'thisIsHashedPassword',
    suggestedSort: 'hot',
    authType: 'user',
    countryCode: '',
    gender: '',
    profilePhoto: '',
    coverPhoto: '',
    //profile
    displayName: '',
    about: '',
    socialLinks: [],
    nsfw: false,
    allowFollow: true,
    contentVisibility: true,
    activeInCommunitiesVisibility: true,
    //safety
    badCommentAutoCollapse: 'off',
    showInSearch: true,
    //feed
    adultContent: false,
    autoPlayMedia: true,
    personalizeAllOfReddit: true,
    personalizeAdsInformation: true,
    personalizeAdsYourActivity: true,
    personalizeRecGeneralLocation: true,
    personalizeRecOurPartners: true,
    useTwoFactorAuthentication: true,
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
