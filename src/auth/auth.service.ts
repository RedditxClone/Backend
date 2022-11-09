import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import type { Types } from 'mongoose';
import { Model } from 'mongoose';

import type { CreateUserDto } from '../user/dto';
import type { User, UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { EmailService } from '../utils';
import type {
  ChangePasswordDto,
  ForgetPasswordDto,
  ForgetUsernameDto,
  LoginDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly mailService: EmailService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * check if the user exist and if the password is valid
   * @param user user that you will check about
   * @param password
   * @returns if the user is valid
   */
  private async isValidUser(
    user: UserDocument | null | undefined,
    password: string,
  ): Promise<boolean> {
    if (!user) {
      return false;
    }

    return this.userService.validPassword(password, user.hashPassword);
  }

  private async createAuthToken(id: string): Promise<string> {
    return this.jwtService.signAsync(
      { id },
      { secret: process.env.JWT_SECRET, expiresIn: '10d' },
    );
  }

  async createChangePasswordToken(username: string) {
    return this.jwtService.signAsync(
      { username },
      { secret: process.env.FORGET_PASSWORD_SECRET, expiresIn: '1h' },
    );
  }

  /**
   * send authorization token to user as cookie
   * @param user user to whom you will send a token
   * @param res express response object
   */
  private async sendAuthToken(
    user: UserDocument,
    res: Response,
  ): Promise<void> {
    const token: string = await this.createAuthToken(user._id);
    res.cookie('authorization', `Bearer ${token}`);
    res.json(user);
  }

  /**
   * login and get access token
   * @param dto see LoginDto
   * @param res @ express response
   */
  login = async (dto: LoginDto, res: Response) => {
    const user: UserDocument = await this.userService.getUserByUsername(
      dto.username,
      true,
    );
    const isValidUser: boolean = await this.isValidUser(user, dto.password);

    if (!isValidUser) {
      throw new UnauthorizedException('wrong email or password');
    }

    await this.sendAuthToken(user, res);
  };

  /**
   * register a new user
   * @param dto see CreateUserDto
   * @param res express response
   */
  signup = async (dto: CreateUserDto, res: Response) => {
    const user: UserDocument = await this.userService.createUser(dto);
    await this.sendAuthToken(user, res);
  };

  async forgetPassword(dto: ForgetPasswordDto) {
    const user: UserDocument | undefined =
      await this.userService.getUserByUsername(dto.username);
    const token: string = await this.createChangePasswordToken(dto.username);
    await this.emailService.sendEmail(
      user.email,
      'FORGET PASSWORD',
      `this is a url to a token ${token}`,
    );

    return { status: 'success' };
  }

  /**
   * A function to change user password.
   *
   * @param id the user id
   * @param password the new password
   * @returns a response 401 if password 404 if the user doesn't exist invalid 200 if changed
   */
  async changePasswordUsingToken(id: Types.ObjectId, password: string) {
    await this.userService.changePassword(id, password);

    return { status: 'success' };
  }

  /**
   * A function to change user password.
   *
   * @param id the user id
   * @param changePasswordDto the new and old password
   * @param res the response to the request
   * @returns a response 401 if password invalid 200 if changed
   */
  changePassword = async (
    id: Types.ObjectId,
    changePasswordDto: ChangePasswordDto,
    res: Response,
  ) => {
    const user: UserDocument = await this.userService.getUserById(id, true);
    const userExist: boolean = await this.isValidUser(
      user,
      changePasswordDto.oldPassword,
    );

    if (userExist) {
      const hashPassword = await bcrypt.hash(
        changePasswordDto.newPassword,
        await bcrypt.genSalt(10),
      );
      await this.userModel.updateOne({ _id: id }, { hashPassword });
      res.status(HttpStatus.OK).json({ status: true });
    } else {
      res.status(HttpStatus.FORBIDDEN).json({ status: false });
    }
  };

  /**
   * A function to search the db for usernames attached to requested email
   * then send it to the user.
   *
   * @param forgetUsernameDto encapsulates the forget username data
   */
  forgetUsername = async (
    forgetUsernameDto: ForgetUsernameDto,
    res: Response,
  ) => {
    try {
      const users: UserDocument[] = await this.userModel.find({
        email: forgetUsernameDto.email,
      });
      let usernames = 'Your Usernames are\n';

      for (const user of users) {
        usernames += user.username;
        usernames += '\n';
      }

      await this.mailService.sendEmail(
        forgetUsernameDto.email,
        `So you wanna know your Reddit username, huh?
      `,
        usernames,
      );
      res.status(HttpStatus.CREATED).json({ status: 'success' });
    } catch {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ status: "couldn't send message" });
    }
  };
}
