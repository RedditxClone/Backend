import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SeederService {
  constructor(private readonly userService: UserService) {}
  async seed() {
    const usr = await this.seedUsers();
    console.log(usr);
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
