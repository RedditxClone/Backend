import type { Types } from 'mongoose';

export class ThingFetch {
  constructor(private userId: Types.ObjectId | undefined) {}

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

  filterOfMySRs() {
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
      {
        $unwind: '$PostUserSubreddit',
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

  getSortObject(sortType: string) {
    const sortOptions = {
      hot: { hotValue: -1 },
      top: { votesCount: -1 },
      new: { publishedAt: -1 },
    };

    if (!Object.keys(sortOptions).includes(sortType)) {
      return sortOptions.top;
    }

    return sortOptions[sortType];
  }

  private prepareToGetHotSorted() {
    return [
      {
        $set: {
          hotValue: {
            $add: [
              { $mod: [{ $toLong: '$publishedDate' }, 1_000_000] },
              { $multiply: [5000, '$votesCount'] },
              { $multiply: [3000, '$commentCount'] },
            ],
          },
        },
      },
    ];
  }

  prepareBeforeStoring(sortType: string) {
    if (sortType === 'hot') {
      return this.prepareToGetHotSorted();
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
          vote: 1,
          nsfw: 1,
          type: 1,
          visited: 1,
          hotValue: 1,
          numericDate: 1,
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
