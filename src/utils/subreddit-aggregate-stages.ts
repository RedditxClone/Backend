import type { Types } from 'mongoose';

import { subredditSelectedFields } from './project-selected-fields';

export const srGetUsersRelated = (userId) => ({
  $lookup: {
    from: 'usersubreddits',
    as: 'joined',
    let: {
      subredditId: '$_id',
    },
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ['$subredditId', '$$subredditId'] },
              { $eq: ['$userId', userId] },
            ],
          },
        },
      },
    ],
  },
});

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
    };
  }

  return {
    $addFields: {
      ...extraFields,
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const srProjectionNumOfUsersAndIfIamJoined = (userId) => ({
  $project: {
    ...subredditSelectedFields,
    joined: 1,
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
