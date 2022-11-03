import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ForgetPasswordDto } from './dto/forgetPassword.dto';
import { LoginDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../user/user.schema';
import { Response } from 'express';
import { CreateUserDto } from '../user/dto';
import { throwGeneralException } from '../utils/throwException';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  /**
   * check if the user exist and if the password is valid
   * @param user user that you will check about
   * @param password
   * @returns if the user is valid
   */
  private async isValidUser(
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
  /**
   * send authorization token to user as cookie
   * @param user user to whom you will send a token
   * @param res express response object
   */
  private async sendToken(user: UserDocument, res: Response): Promise<void> {
    const token: string = await this.createToken(user._id);
    res.cookie('authorization', `Bearer ${token}`);
    res.json({ status: 'success', user });
  }
  /**
   * login and get access token
   * @param dto see LoginDto
   * @param res @ express response
   */
  login = async (dto: LoginDto, res: Response) => {
    try {
      const user: UserDocument = await this.userService.getUserByEmail(
        dto.email,
      );
      const userExist: boolean = await this.isValidUser(user, dto.password);
      if (!userExist)
        throw new UnauthorizedException('wrong email or password');
      await this.sendToken(user, res);
    } catch (err) {
      throwGeneralException(err);
    }
  };
  /**
   * register a new user
   * @param dto see CreateUserDto
   * @param res express response
   */
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
}
