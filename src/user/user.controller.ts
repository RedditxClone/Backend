import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from '../utils/utils.service';
import { CreateUserDto } from './dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('')
  async createUser(@Body() dto: CreateUserDto) {
    return await this.userService.createUser(dto);
  }

  @Get('/:id')
  async getUser(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return await this.userService.getUserById(id);
  }
}
