import { Injectable } from '@nestjs/common';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ForgetPasswordDto } from './dto/forgetPassword.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  login(loginDto: LoginDto) {
    return 'this action login the user to his account'
  }
  signup(signupDto: SignupDto) {
    return 'this action create a new user account'
  }
  forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    return 'this action apply forget password steps'
  }
  changePassword(changePasswordDto: ChangePasswordDto) {
    return 'this action change the password of the current user'
  }
}
