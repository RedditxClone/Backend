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
          // for post
          subredditId: {
            $toObjectId: '$subredditId',
          },
          // for comment
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
      {
        $unwind: '$me',
      },
    ];
  }

  filterForSavedOnly() {
    return [
      ...this.getMe(),
      {
        $match: {
          $expr: {
            $in: ['$_id', '$me.savedPosts'],
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
      new: { publishedAt: -1, _id: 1 },
      old: { publishedAt: 1, _id: -1 },
      best: { bestValue: -1, _id: 1 },
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

  getPostProject() {
    return [
      {
        $project: {
          text: 1,
          title: 1,
          userId: 1,
          postId: 1,
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
            isModerator: {
              $cond: [
                {
                  $in: [
                    '$me.username',
                    {
                      $arrayElemAt: [
                        { $ifNull: ['$subreddit.moderators', [[]]] },
                        0,
                      ],
                    },
                  ],
                },
                true,
                false,
              ],
            },
          },
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
          user: {
            id: '$user._id',
            photo: '$user.profilePhoto',
            username: '$user.username',
            isFollowed: {
              $cond: [
                { $gt: [{ $size: { $ifNull: ['$follow', []] } }, 0] },
                true,
                false,
              ],
            },
          },
        },
      },
    ];
  }

  getCommentProject() {
    return [
      {
        $project: {
          text: 1,
          title: 1,
          userId: 1,
          postId: 1,
          votesCount: 1,
          publishedDate: 1,
          spoiler: 1,
          nsfw: 1,
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
          user: {
            id: '$user._id',
            photo: '$user.profilePhoto',
            username: '$user.username',
          },
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
}
