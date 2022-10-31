import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import { UserService } from '../user/user.service';

import {
  ForgetUsernameDto,
  ChangePasswordDto,
  ForgetPasswordDto,
  LoginDto,
  SignupDto,
} from './dto';
import { EmailService } from 'src/utils';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { CreateUserDto } from '../user/dto';
import { throwGeneralException } from '../utils/throwException';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly mailService: EmailService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  private async isUserExist(
    user: UserDocument,
    password: string,
  ): Promise<boolean> {
    return (
      user &&
      (await this.userService.validPassword(password, user.hashPassword))
    );
  }
  private async createToken(id: string): Promise<string> {
    return await this.jwtService.signAsync(
      { id },
      {
        secret: process.env.JWT_SECRET,
      },
    );
  }
  private async sendToken(user: UserDocument, res: Response): Promise<void> {
    const token: string = await this.createToken(user._id);
    res.cookie('authorization', `Bearer ${token}`);
    res.json({ status: 'success', user });
  }
  login = async (dto: LoginDto, res: Response) => {
    try {
      const user: UserDocument = await this.userService.getUserByEmail(
        dto.email,
      );
      const userExist: boolean = await this.isUserExist(user, dto.password);
      if (!userExist)
        throw new UnauthorizedException('wrong email or password');
      await this.sendToken(user, res);
    } catch (err) {
      throwGeneralException(err);
    }
  };
  signup = async (dto: CreateUserDto, res: Response) => {
    try {
      const user: UserDocument = await this.userService.createUser(dto);
      await this.sendToken(user, res);
    } catch (err) {
      throwGeneralException(err);
    }
  };
  forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    return 'this action apply forget password steps';
  }
  changePassword(changePasswordDto: ChangePasswordDto) {
    return 'this action change the password of the current user';
  }
  /**
   * A function to search the db for usernames attached to requested email
   * then send it to the user.
   *
   * @param forgetUsernameDto encapsulates the forget username data
   */
  forgetUsername = async (forgetUsernameDto: ForgetUsernameDto) => {
    try {
      const users: UserDocument[] = await this.userModel.find({
        email: forgetUsernameDto.email,
      });
      if (!users)
        throw new BadRequestException(
          `there is no user with email ${forgetUsernameDto.email}`,
        );
      let usernames = 'Your Usernames are\n';
      users.forEach((user) => {
        usernames += user.username;
        usernames += '\n';
      });
      this.mailService.sendEmail(
        forgetUsernameDto.email,
        `So you wanna know your Reddit username, huh?
      `,
        usernames,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  };
}
