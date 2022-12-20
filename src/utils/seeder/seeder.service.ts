import { Injectable, Logger } from '@nestjs/common';
import type { CreateUserDto } from 'user/dto';
import type { UserDocument } from 'user/user.schema';

import { UserService } from '../../user/user.service';

/**
 * Provide seeding functionality
 *
 * @service
 */
@Injectable()
export class SeederService {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {}

  /**
   * Run all seeding subroutines
   */
  async seed() {
    await this.seedUsers();
    this.logger.debug('Successfuly seeded users...');
  }

  /**
   * Seed users into database.
   * This includes seeding the superuser admin.
   */
  private async seedUsers(): Promise<UserDocument> {
    if (
      process.env.SU_USERNAME === undefined ||
      process.env.SU_EMAIL === undefined ||
      process.env.SU_PASS === undefined
    ) {
      this.logger.error(
        'Superuser is improperly configured.\nDid you set the environment variables?',
      );

      throw new Error('Improperly configured');
    }

    const createSuperUserDto: CreateUserDto = {
      username: process.env.SU_USERNAME,
      email: process.env.SU_EMAIL,
      password: process.env.SU_PASS,
    };

    const superuser = await this.userService.createUser(createSuperUserDto);

    return this.userService.makeAdmin(superuser._id);
  }
}
