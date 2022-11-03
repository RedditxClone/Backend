<<<<<<< HEAD
import { Injectable } from '@nestjs/common';

import type { ChangePasswordDto } from './dto/change-password.dto';
import type { ForgetPasswordDto } from './dto/forget-password.dto';
import type { LoginDto } from './dto/login.dto';
import type { SignupDto } from './dto/signup.dto';
||||||| ceebe63
import { Injectable } from '@nestjs/common';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ForgetPasswordDto } from './dto/forgetPassword.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
=======
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
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
import { EmailService } from '../utils';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { CreateUserDto } from '../user/dto';
import { throwGeneralException } from '../utils/throwException';
>>>>>>> development

@Injectable()
export class AuthService {
<<<<<<< HEAD
  login(_loginDto: LoginDto) {
    return 'this action login the user to his account';
||||||| ceebe63
  login(loginDto: LoginDto) {
    return 'this action login the user to his account';
=======
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
>>>>>>> development
  }
<<<<<<< HEAD

  signup(_signupDto: SignupDto) {
    return 'this action create a new user account';
||||||| ceebe63
  signup(signupDto: SignupDto) {
    return 'this action create a new user account';
=======
  private async createToken(id: string): Promise<string> {
    return await this.jwtService.signAsync(
      { id },
      {
        secret: process.env.JWT_SECRET,
      },
    );
>>>>>>> development
  }
<<<<<<< HEAD

  forgetPassword(_forgetPasswordDto: ForgetPasswordDto) {
||||||| ceebe63
  forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
=======
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
>>>>>>> development
    return 'this action apply forget password steps';
  }

  changePassword(_changePasswordDto: ChangePasswordDto) {
    return 'this action change the password of the current user';
  }
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
      users.forEach((user) => {
        usernames += user.username;
        usernames += '\n';
      });
      await this.mailService.sendEmail(
        forgetUsernameDto.email,
        `So you wanna know your Reddit username, huh?
      `,
        usernames,
      );
      res.status(HttpStatus.CREATED).json({ status: 'success' });
    } catch (err) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ status: "couldn't send message" });
    }
  };
}
