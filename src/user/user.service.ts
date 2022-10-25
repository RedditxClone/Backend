import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/user.dto';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}
  createUser = async (dto: CreateUserDto): Promise<User> => {
    try {
      const user: User = await this.userModel.create({
        ...dto,
        hashPassword: dto.password,
      });
      return user;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  };
  getUserById = async (id: Types.ObjectId): Promise<User> => {
    try {
      const user: User = await this.userModel.findById(id);
      return user;
    } catch (err) {
      console.log(err);
      throw new BadRequestException('something went wrong');
    }
  };
}
