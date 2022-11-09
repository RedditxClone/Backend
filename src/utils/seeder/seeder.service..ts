import { Injectable } from '@nestjs/common';
import type { CreateUserDto } from 'src/user/dto';

import { UserService } from './../../user/user.service';

@Injectable()
export class SeederService {
  constructor(private readonly userService: UserService) {}

  async seed() {
    await this.seedUsers();
  }

  private async seedUsers() {
    const createSuperUserDto: CreateUserDto = {
      username: process.env.SU_USERNAME,
      email: process.env.SU_EMAIL,
      password: process.env.SU_PASS,
      age: 30,
    };

    return this.userService.createUser(createSuperUserDto);
  }
}
