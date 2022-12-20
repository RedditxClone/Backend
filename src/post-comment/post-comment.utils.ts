import type { Types } from 'mongoose';

export class ThingFetch {
  constructor(private readonly userId: Types.ObjectId | undefined) {}

  prepare() {
    return [
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $set: {
          thingId: { $toObjectId: '$_id' },
          subredditId: {
            $toObjectId: '$subredditId',
          },
          commentPostId: { $toObjectId: '$postId' },
          userId: {
            $toObjectId: '$userId',
          },
        },
      },
      ...this.getIsFollowed(),
      ...this.getIsJoined(),
    ];
  }

  onlyOnePost(postId: Types.ObjectId) {
    return [
      {
        $match: {
          $expr: {
            $eq: [postId, '$_id'],
          },
        },
      },
    ];
  }

  getHidden() {
    return [
      this.filterHidden()[0],
      {
        $match: {
          $expr: {
            $ne: ['$hide', []],
          },
        },
      },
    ];
  }

  getMe() {
    return [
      {
        $lookup: {
          as: 'me',
          from: 'users',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', this.userId],
                },
              },
            },
          ],
        },
      },
    ];
  }

  filterForSavedOnly() {
    return [
      ...this.getMe(),
      {
        $match: {
          $expr: {
            $in: [
              '$_id',
              { $ifNull: [this.mongoIndexAt('$me.savedPosts', 0), []] },
            ],
          },
        },
      },
    ];
  }

  getIsJoined() {
    return [
      {
        $lookup: {
          from: 'usersubreddits',
          as: 'PostUserSubreddit',
          let: {
            subredditId: '$subredditId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$subredditId', '$$subredditId'] },
                    { $eq: ['$userId', this.userId] },
                  ],
                },
              },
            },
          ],
        },
      },
    ];
  }

  filterOfMySRs() {
    return [
      ...this.getIsJoined(),
      {
        $unwind: '$PostUserSubreddit',
      },
    ];
  }

  matchAllRelatedPosts() {
    return [
      {
        $match: {
          $expr: {
            $or: [
              { $ne: ['$PostUserSubreddit', []] },
              { $ne: ['$follow', []] },
              { $eq: ['$userId', this.userId] },
            ],
          },
        },
      },
    ];
  }

  filterHidden() {
    return [
      {
        $lookup: {
          from: 'hides',
          as: 'hide',
          let: {
            thingId: '$thingId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$$thingId', '$postId'] },
                    { $eq: ['$userId', this.userId] },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $match: {
          $expr: {
            $eq: ['$hide', []],
          },
        },
      },
    ];
  }

  filterBlocked() {
    return [
      {
        $lookup: {
          from: 'blocks',
          as: 'block',
          let: {
            userId: '$userId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [
                        { $eq: ['$blocked', this.userId] },
                        { $eq: ['$blocker', '$$userId'] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ['$blocker', this.userId] },
                        { $eq: ['$blocked', '$$userId'] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $match: {
          $expr: {
            $eq: ['$block', []],
          },
        },
      },
    ];
  }

  getIsFollowed() {
    return [
      {
        $lookup: {
          from: 'follows',
          as: 'follow',
          let: {
            userId: '$userId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [
                        { $eq: ['$followed', this.userId] },
                        { $eq: ['$follower', '$$userId'] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ['$follower', this.userId] },
                        { $eq: ['$followed', '$$userId'] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    ];
  }

  SRInfo() {
    return [
      {
        $lookup: {
          from: 'subreddits',
          as: 'subreddit',
          localField: 'subredditId',
          foreignField: '_id',
        },
      },
    ];
  }

  userInfo() {
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
    ];
  }

  voteInfo() {
    return [
      {
        $lookup: {
          from: 'votes',
          as: 'vote',
          let: {
            thingId: '$thingId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$$thingId', '$thingId'] },
                    { $eq: ['$userId', this.userId] },
                  ],
                },
              },
            },
          ],
        },
      },
    ];
  }

  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  getPaginated(page = 1, limit = 10) {
    return [
      {
        $skip: ((Number(page) || 1) - 1) * Number(limit),
      },
      {
        $limit: Number(limit),
      },
    ];
  }

  getSortObject(sortType: string | undefined) {
    const sortOptions = {
      hot: { hotValue: -1, _id: 1 },
      top: { votesCount: -1, _id: 1 },
      new: { publishedDate: -1, _id: 1 },
      old: { publishedDate: 1, _id: -1 },
      best: { bestValue: -1, _id: 1 },
      comments: { commentCount: -1, _id: 1 },
    };

    if (!sortType || !Object.keys(sortOptions).includes(sortType)) {
      return sortOptions.new;
    }

    return sortOptions[sortType];
  }

  private prepareToGetHotSorted() {
    return [
      {
        $set: {
          hotValue: {
            $add: [
              { $mod: [{ $toLong: '$publishedDate' }, 10_000_000] },
              { $multiply: [50_000, '$votesCount'] },
              { $multiply: [30_000, '$commentCount'] },
            ],
          },
        },
      },
    ];
  }

  private prepareToGetBestSorted() {
    return [
      {
        $set: {
          bestValue: {
            $add: [
              { $mod: [{ $toLong: '$publishedDate' }, 10_000_000] },
              { $multiply: [70_000, '$votesCount'] },
              { $multiply: [70_000, '$commentCount'] },
            ],
          },
        },
      },
    ];
  }

  prepareBeforeStoring(sortType: string | undefined) {
    if (sortType?.toLocaleLowerCase() === 'hot') {
      return this.prepareToGetHotSorted();
    }

    if (sortType?.toLocaleLowerCase() === 'best') {
      return this.prepareToGetBestSorted();
    }

    return [];
  }

  getPostInfo() {
    return {
      text: 1,
      title: 1,
      replyNotifications: {
        $ifNull: ['$replyNotifications', false],
      },
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
      commentsLocked: 1,
      spammedBy: 1,
      spammedAt: 1,
      nsfw: 1,
      type: 1,
      postType: 1,
      images: {
        $map: {
          input: '$images',
          as: 'image',
          in: { $concat: ['/assets/posts-media/', '$$image'] },
        },
      },
    };
  }

  getPostProject() {
    return [
      {
        $project: {
          ...this.getPostInfo(),
          ...this.voteType(),
          ...this.getIsSavedInfo(),
          ...this.getSubredditInfo(),
          ...this.getUserInfo(),
        },
      },
    ];
  }

  postInfoOfComment() {
    return [
      {
        $lookup: {
          from: 'postcomments',
          as: 'post',
          localField: 'postId',
          foreignField: '_id',
        },
      },
      {
        $lookup: {
          from: 'users',
          as: 'postUser',
          let: {
            postUserId: this.mongoIndexAt('$post.userId', 0),
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$$postUserId', '$_id'],
                },
              },
            },
          ],
        },
      },
    ];
  }

  getUserInfo() {
    return {
      user: {
        id: '$user._id',
        photo: '$user.profilePhoto',
        username: '$user.username',
        name: '$user.displayName',
        isFollowed: {
          $cond: [
            { $gt: [{ $size: { $ifNull: ['$follow', []] } }, 0] },
            true,
            false,
          ],
        },
        cakeDay: '$user.cakeDay',
        createdAt: '$user.createdAt',
      },
    };
  }

  mongoIndexAt(arrayName, index) {
    return {
      $arrayElemAt: [arrayName, index],
    };
  }

  commentInfo() {
    return {
      text: 1,
      postInfo: {
        id: this.mongoIndexAt('$post._id', 0),
        title: this.mongoIndexAt('$post.title', 0),
      },
      userPostInfo: {
        username: this.mongoIndexAt('$postUser.username', 0),
        userId: this.mongoIndexAt('$post.userId', 0),
        name: this.mongoIndexAt('$postUser.displayName', 0),
      },
      replyNotification: 1,
      title: 1,
      postId: 1,
      parentId: 1,
      votesCount: 1,
      publishedDate: 1,
      spoiler: 1,
      nsfw: 1,
      spammedBy: 1,
      spammedAt: 1,
      approvedBy: 1,
      approvedAt: 1,
    };
  }

  voteType() {
    return {
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
    };
  }

  getCommentProject() {
    return [
      {
        $project: {
          ...this.commentInfo(),
          ...this.voteType(),
          ...this.getUserInfo(),
        },
      },
    ];
  }

  matchForSpecificUser() {
    return [
      {
        $match: { userId: this.userId },
      },
    ];
  }

  matchForSpecificFilter(filter: any) {
    return [
      {
        $match: filter,
      },
    ];
  }

  getSubredditInfo() {
    return {
      subredditInfo: {
        id: { $arrayElemAt: ['$subreddit._id', 0] },
        name: { $arrayElemAt: ['$subreddit.name', 0] },
        isJoin: {
          $cond: [
            {
              $gt: [{ $size: { $ifNull: ['$PostUserSubreddit', []] } }, 0],
            },
            true,
            false,
          ],
        },
        joinDate: {
          $ifNull: [this.mongoIndexAt('$PostUserSubreddit.date', 0), null],
        },
        description: this.mongoIndexAt('$subreddit.description', 0),
        icon: this.mongoIndexAt('$subreddit.icon', 0),
        membersCount: this.mongoIndexAt('$subreddit.users', 0),
        isModerator: {
          $cond: [
            {
              $in: [
                this.mongoIndexAt('$me.username', 0),
                {
                  $ifNull: [{ $arrayElemAt: ['$subreddit.moderators', 0] }, []],
                },
              ],
            },
            true,
            false,
          ],
        },
      },
      flair: {
        $arrayElemAt: [
          {
            $filter: {
              input: this.mongoIndexAt('$subreddit.flairList', 0),
              as: 'flairItem',
              cond: {
                $eq: [
                  { $toString: '$$flairItem._id' },
                  { $toString: '$flair' },
                ],
              },
            },
          },
          0,
        ],
      },
    };
  }

  getDiscoverProject() {
    return [
      {
        $project: {
          image: { $concat: ['/assets/post-media/', '$images'] },
          subredditInfo: {
            id: { $arrayElemAt: ['$subreddit._id', 0] },
            name: { $arrayElemAt: ['$subreddit.name', 0] },
          },
          _id: 0,
          postId: {
            $toObjectId: '$_id',
          },
        },
      },
    ];
  }

  filterBannedUsers() {
    return [
      {
        $match: {
          $expr: {
            $not: [
              {
                $in: [
                  this.mongoIndexAt('$me.username', 0),
                  this.mongoIndexAt('$subreddit.bannedUsers', 0),
                ],
              },
            ],
          },
        },
      },
    ];
  }

  getIsSavedInfo() {
    return {
      isSaved: {
        $in: [
          '$_id',
          { $ifNull: [this.mongoIndexAt('$me.savedPosts', 0), []] },
        ],
      },
    };
  }

  matchToGetUpvoteOnly() {
    return [
      ...this.voteInfo(),
      {
        $unwind: '$vote',
      },
      {
        $match: {
          $expr: {
            $eq: ['$vote.isUpvote', true],
          },
        },
      },
    ];
  }

  matchToGetDownvoteOnly() {
    return [
      ...this.voteInfo(),
      {
        $unwind: '$vote',
      },
      {
        $match: {
          $expr: {
            $eq: ['$vote.isUpvote', false],
          },
        },
      },
    ];
  }

  filterDate(time: number) {
    const date = new Date();
    let dayPast = 0;

    if (time === 3) {
      dayPast = 7;
    } else if (time === 4) {
      dayPast = 1;
    }

    const d1 = [
      time === 1 ? date.getFullYear() - 1 : date.getFullYear(),
      time === 2 ? date.getMonth() - 1 : date.getMonth(),
      date.getDate() - dayPast,
      time === 5 ? date.getHours() - 1 : date.getHours(),
    ];

    const d2 = [
      time === 1 ? d1[0] + 1 : d1[0],
      time === 2 ? d1[1] + 1 : date.getMonth(),
      time === 3 || time === 4 ? d1[2] + dayPast : d1[2],
      time === 5 ? d1[3] + 1 : d1[3],
    ];
    const min = date.getMinutes();
    const sec = date.getSeconds();

    return [
      {
        publishedDate: {
          $gte: new Date(d1[0], d1[1], d1[2], d1[3], min, sec),
          $lt: new Date(d2[0], d2[1], d2[2], d2[3], min, sec),
        },
      },
    ];
  }
}
