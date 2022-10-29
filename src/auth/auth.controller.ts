import { Controller, Post, Body, Patch } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgetPasswordDto,
  LoginDto,
  SignupDto,
  SigninDto,
  ForgetUsernameDto,
} from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ description: 'Login user to his account' })
  @ApiCreatedResponse({
    description: 'Autherized Successfully',
    type: SigninDto,
  })
  @ApiUnauthorizedResponse({ description: 'Wrong email or password' })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ description: 'Create a new user account' })
  @ApiCreatedResponse({
    description: 'Account created successfully',
    type: SigninDto,
  })
  @ApiForbiddenResponse({ description: 'The email is used' })
  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @ApiOperation({ description: 'Recover the password of an account' })
  @ApiCreatedResponse({
    description: 'An email will be sent if the user exists in the database',
  })
  @Post('forget_password')
  forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }

  @ApiOperation({ description: 'Recover the password of an account' })
  @ApiCreatedResponse({
    description: 'An email will be sent if the user exists in the database',
  })
  @Post('forget_username')
  forgetUsername(@Body() forgetUsernameDto: ForgetUsernameDto) {
    return forgetUsernameDto;
  }

  @ApiOperation({ description: 'Change the password of an account' })
  @ApiOkResponse({ description: 'The password changed successfully' })
  @ApiUnauthorizedResponse({ description: 'UnAuthorized' })
  @ApiForbiddenResponse({ description: 'Wrong password' })
  @Patch('change_password')
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto);
  }
}
