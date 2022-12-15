import type { Types } from 'mongoose';

import { subredditSelectedFields } from './project-selected-fields';

export const srGetUsersRelated = {
  $lookup: {
    from: 'usersubreddits',
    localField: '_id',
    foreignField: 'subredditId',
    as: 'users',
  },
};

export const srProjectionNumOfUsersAndIfModerator = (
  userId: Types.ObjectId | undefined,
  username: string,
) => {
  let extraFields: any;

  if (userId) {
    extraFields = {
      moderator: {
        $in: [username, '$moderators'],
      },
      joined: {
        $arrayElemAt: [
          {
            $filter: {
              input: '$users',
              cond: { $eq: ['$$this.userId', userId] },
            },
          },
          0,
        ],
      },
    };
  }

  return {
    $addFields: {
      users: { $size: '$users' },
      ...extraFields,
    },
  };
};

export const srProjectionNumOfUsersAndIfIamJoined = (userId) => ({
  $project: {
    ...subredditSelectedFields,
    users: { $size: '$users' },
    joined: {
      $arrayElemAt: [
        {
          $filter: {
            input: '$users',
            cond: { $eq: ['$$this.userId', userId] },
          },
        },
        0,
      ],
    },
  },
});

export const srPagination = (page, limit) => [
  {
    $skip: ((Number(page) || 1) - 1) * Number(limit),
  },
  {
    $limit: Number(limit),
  },
];
