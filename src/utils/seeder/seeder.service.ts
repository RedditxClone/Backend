import { Injectable, Logger } from '@nestjs/common';
import type { CreateUserDto } from 'user/dto';

import { PostService } from '../../post/post.service';
import { SubredditService } from '../../subreddit/subreddit.service';
import { UserService } from '../../user/user.service';
import { joins, posts, subreddits, users } from './data/seeder-data';

/**
 * Provide seeding functionality
 *
 * @service
 */
@Injectable()
export class SeederService {
  constructor(
    private readonly userService: UserService,
    private readonly subredditService: SubredditService,
    private readonly postService: PostService,
    private readonly logger: Logger,
  ) {}

  /**
   * Run all seeding subroutines
   */
  async seed() {
    await this.seedAdmin();
    await this.seedUsers();
    await this.seedSubreddits();
    await this.seedJoins();
    await this.seedPosts();
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
    let hasError = false;

    const results = await Promise.allSettled(
      users.map(async (userData) => this.userService.createUser(userData)),
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        hasError = true;
        this.logger.error(`Could not seed user: ${result.reason}`);
      }
    }

    if (hasError) {
      this.logger.warn('Seeded users with errors...');
    } else {
      this.logger.log('Successfuly seeded users...');
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
  private async seedPosts(): Promise<void> {
    let hasError = 'no';

    await Promise.all(
      posts.map(async (postData) => {
        const user = await this.userService.getUserByUsername(
          postData.username,
        );
        const subreddit = await this.subredditService.findSubredditByName(
          postData.subreddit,
        );

        const subredditId = subreddit._id;

        return this.postService
          .create(user._id, { subredditId, ...postData.data })
          .catch((error) => {
            hasError = 'yes';
            this.logger.error(
              `Could not seed post: ${user.username} posting in ${subreddit.name}\nReason: ${error}`,
            );
          });
      }),
    );

    if (hasError !== 'no') {
      this.logger.log('Successfuly seeded posts...');
    } else {
      this.logger.warn('Seeded posts with errors...');
    }
  }
}
