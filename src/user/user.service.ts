import { BadRequestException, Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/user.dto';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';

@Global()
@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}
  block() {
    return 'block a user';
  }

  getFriends() {
    return 'get user list of friends';
  }

  acceptFriendRequest() {
    return 'accept user friend request';
  }

  sendFriendRequest() {
    return 'send a friend request';
  }

  deleteFriendRequest() {
    return 'delete a friend request';
  }

  unFriend() {
    return 'delete a friend';
  }
  createUser = async (dto: CreateUserDto): Promise<UserDocument> => {
    try {
      const hashPassword = await bcrypt.hash(
        dto.password,
        await bcrypt.genSalt(10),
      );
      const user: UserDocument = await this.userModel.create({
        ...dto,
        hashPassword,
      });
      return user;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  };
  getUserById = async (id: Types.ObjectId): Promise<UserDocument> => {
    try {
      const user: UserDocument = await this.userModel.findById(id);
      if (!user)
        throw new BadRequestException(`there is no user with id ${id}`);
      return user;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  };
  getUserByEmail = async (email: string): Promise<UserDocument> => {
    const user: UserDocument = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException(`no user with email ${email}`);
    return user;
  };
  async validPassword(
    userPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(userPassword, hashedPassword);
  }
}
