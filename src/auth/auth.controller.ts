import { Controller, Post, Body, } from '@nestjs/common';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ForgetPasswordDto } from './dto/forgetPassword.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@ApiTags("auth")
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ description: 'Login user to his account' })
  @ApiOkResponse({ description: 'Autherized Successfully' })
  @ApiUnauthorizedResponse({ description: 'Wrong email or password' })
  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @ApiOperation({ description: 'Create a new user account' })
  @ApiCreatedResponse({ description: 'Account created successfully' })
  @ApiForbiddenResponse({ description: 'The email is used' })
  @Post("signup")
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto)
  }

  @ApiOperation({ description: 'Recover the password of an account' })
  @ApiOkResponse({ description: 'The email send to your account' })
  @Post("forget_password")
  forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto)    
  }

  @ApiOperation({ description: 'Change the password of an account' })
  @ApiOkResponse({ description: 'The password changed successfully' })
  @ApiUnauthorizedResponse( {description: 'Unautherized'} )
  @ApiForbiddenResponse( {description: 'Wrong password'} )
  @Post("change_password")
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto)
  }  
}
