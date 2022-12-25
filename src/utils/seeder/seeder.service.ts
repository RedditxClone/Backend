import { Injectable, Logger } from '@nestjs/common';
import type { CreateUserDto } from 'user/dto';

import { CommentService } from '../../comment/comment.service';
import { FollowService } from '../../follow/follow.service';
import { PostService } from '../../post/post.service';
import { SubredditService } from '../../subreddit/subreddit.service';
import { UserService } from '../../user/user.service';
import {
  follows,
  joins,
  postComments,
  subreddits,
  users,
} from './data/seeder-data';

/**
 * Provide database seeding functionality
 */
@Injectable()
export class SeederService {
  /**
   * class constructor
   * @param userService user service
   * @param subredditService subreddit service
   * @param postService post service
   * @param commentService comment service
   * @param followService follow service
   * @param logger logger factory
   */
  constructor(
    private readonly userService: UserService,
    private readonly subredditService: SubredditService,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    private readonly followService: FollowService,
    private readonly logger: Logger,
  ) {}

  /**
   * Run all seeding subroutines
   */
  async seed() {
    await this.seedAdmin();
    await this.seedUsers();
    await this.seedFollows();
    await this.seedSubreddits();
    await this.seedJoins();
    await this.seedPostComments();
  }

  /**
   * Seed superuser admin.
   */
  private async seedAdmin(): Promise<void> {
    if (
      process.env.SU_USERNAME === undefined ||
      process.env.SU_EMAIL === undefined ||
      process.env.SU_PASS === undefined
    ) {
      this.logger.error(
        'Could not seed admin: Superuser is improperly configured.\nDid you set the environment variables?',
      );

      return;
    }

    const createSuperUserDto: CreateUserDto = {
      username: process.env.SU_USERNAME,
      email: process.env.SU_EMAIL,
      password: process.env.SU_PASS,
    };

    const superuser = await this.userService.createUser(createSuperUserDto);

    await this.userService.makeAdmin(superuser._id);

    this.logger.log('Successfuly seeded admin...');
  }

  /**
   * Seed users.
   */
  private async seedUsers(): Promise<void> {
    let hasError = 'no';

    await Promise.all(
      users.map(async (userData) =>
        this.userService.createUser(userData).catch((error) => {
          hasError = 'yes';
          this.logger.error(
            `Could not seed user: ${userData.username} \nReason: ${error}`,
          );
        }),
      ),
    );

    if (hasError !== 'no') {
      this.logger.warn('Seeded users with errors...');
    } else {
      this.logger.log('Successfuly seeded users...');
    }
  }

  /**
   * Seed follows.
   */
  private async seedFollows(): Promise<void> {
    let hasError = 'no';

    await Promise.all(
      follows.map(async (followData) => {
        const userFollower = await this.userService.getUserByUsername(
          followData.follower,
        );
        const userFollowed = await this.userService.getUserByUsername(
          followData.followed,
        );

        return this.followService
          .follow({ follower: userFollower._id, followed: userFollowed._id })
          .catch((error) => {
            hasError = 'yes';
            this.logger.error(
              `Could not seed join: ${userFollower.username} following ${userFollowed.username}\nReason: ${error}`,
            );
          });
      }),
    );

    if (hasError !== 'no') {
      this.logger.warn('Seeded follows with errors...');
    } else {
      this.logger.log('Successfuly seeded follows...');
    }
  }

  /**
   * Seed subreddits.
   */
  private async seedSubreddits(): Promise<void> {
    let hasError = 'no';

    await Promise.all(
      subreddits.map(async (srData) => {
        const user = await this.userService.getUserByUsername(srData.username);

        return this.subredditService
          .create(srData.data, user.username, user._id)
          .catch((error) => {
            hasError = 'yes';
            this.logger.error(
              `Could not seed subreddit: ${user.username} creating ${srData.data}\nReason: ${error}`,
            );
          });
      }),
    );

    if (hasError !== 'no') {
      this.logger.warn('Seeded subreddits with errors...');
    } else {
      this.logger.log('Successfuly seeded subreddits...');
    }
  }

  /**
   * Seed joins.
   */
  private async seedJoins(): Promise<void> {
    let hasError = 'no';

    await Promise.all(
      joins.map(async (joinData) => {
        const user = await this.userService.getUserByUsername(
          joinData.username,
        );
        const subreddit = await this.subredditService.findSubredditByName(
          joinData.subreddit,
        );

        return this.subredditService
          .joinSubreddit(user._id, subreddit._id)
          .catch((error) => {
            hasError = 'yes';
            this.logger.error(
              `Could not seed join: ${user.username} joining ${subreddit.name}\nReason: ${error}`,
            );
          });
      }),
    );

    if (hasError !== 'no') {
      this.logger.warn('Seeded joins with errors...');
    } else {
      this.logger.log('Successfuly seeded joins...');
    }
  }

  /**
   * Seed posts.
   */
  private async seedPostComments(): Promise<void> {
    let hasError = 'no';

    await Promise.all(
      postComments.map(async (postData) => {
        const user = await this.userService.getUserByUsername(
          postData.username,
        );
        const subreddit = await this.subredditService.findSubredditByName(
          postData.subreddit,
        );

        const subredditId = subreddit._id;

        const post = await this.postService
          .create(user._id, { subredditId, ...postData.data })
          .catch((error) => {
            hasError = 'yes';
            this.logger.error(
              `Could not seed post: ${user.username} posting in ${subreddit.name}\nReason: ${error}`,
            );
          });

        if (postData.comments) {
          return Promise.all(
            postData.comments.map((comment) =>
              this.recCreateComment(comment, post, post, subredditId),
            ),
          );
        }
      }),
    );

    if (hasError !== 'no') {
      this.logger.warn('Seeded posts and comments with errors...');
    } else {
      this.logger.log('Successfuly seeded posts and comments...');
    }
  }

  /**
   * Helper function to recursively create comments
   * @param commentData Data of comment
   * @param post Ancestor post of comment
   * @param parent Direct parent post or comment of comment
   * @param subredditId MongoId of subreddit containing comment
   */
  private async recCreateComment(commentData, post, parent, subredditId) {
    const user = await this.userService.getUserByUsername(commentData.username);
    const commentRes = await this.commentService
      .create(user.username, user._id, {
        parentId: parent._id,
        postId: post._id,
        subredditId,
        text: commentData.text,
      })
      .catch((error) => {
        this.logger.error(
          `Could not seed comment: ${user.username} commenting on ${post.title}\nReason: ${error}`,
        );
      });

    if (commentData.comments) {
      return Promise.all(
        commentData.comments.map((comment) =>
          this.recCreateComment(comment, post, commentRes, subredditId),
        ),
      );
    }
  }
}
