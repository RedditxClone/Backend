import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import {
  ForgetUsernameDto,
  ChangePasswordDto,
  ForgetPasswordDto,
  LoginDto,
  SignupDto,
} from './dto';
import { EmailService } from 'src/utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly mailService: EmailService,
  ) {}
  login(loginDto: LoginDto) {
    return 'this action login the user to his account';
  }
  signup(signupDto: SignupDto) {
    return 'this action create a new user account';
  }
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
