import { Injectable } from '@nestjs/common';

import type { ChangePasswordDto } from './dto/change-password.dto';
import type { ForgetPasswordDto } from './dto/forget-password.dto';
import type { LoginDto } from './dto/login.dto';
import type { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  login(_loginDto: LoginDto) {
    return 'this action login the user to his account';
  }

  signup(_signupDto: SignupDto) {
    return 'this action create a new user account';
  }

  forgetPassword(_forgetPasswordDto: ForgetPasswordDto) {
    return 'this action apply forget password steps';
  }

  changePassword(_changePasswordDto: ChangePasswordDto) {
    return 'this action change the password of the current user';
  }
}
