export const subredditSelectedFields = {
  _id: 1,
  name: 1,
  description: 1,
  icon: 1,
  flairList: 1,
  welcomeMessageText: 1,
  over18: 1,
  categories: 1,
  createdDate: 1,
};

export const userSelectedFields = {
  _id: 1,
  username: 1,
  profilePhoto: 1,
  about: 1,
  cakeDay: 1,
  coverPhoto: 1,
  nsfw: 1,
  allowFollow: 1,
};

export const postSelectedFileds = {
  _id: 1,
  text: 1,
  title: 1,
  userId: 1,
  postId: 1,
  votesCount: 1,
  commentCount: 1,
  publishedDate: 1,
  flair: 1,
  spoiler: 1,
  approvedBy: 1,
  approvedAt: 1,
  isEdited: 1,
  removedBy: 1,
  removedAt: 1,
  editCheckedBy: 1,
  nsfw: 1,
  type: 1,
  visited: 1,
  voteType: {
    $cond: [
      { $eq: ['$vote', []] },
      undefined,
      {
        $cond: [
          { $eq: ['$vote.isUpvote', [true]] },
          'upvote',
          {
            $cond: [
              { $eq: ['$vote.isUpvote', [false]] },
              'downvote',
              undefined,
            ],
          },
        ],
      },
    ],
  },
  images: 1,
};
