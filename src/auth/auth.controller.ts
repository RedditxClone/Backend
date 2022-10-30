import { Controller, Post, Body, Res, Patch } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ForgetPasswordDto } from './dto/forgetPassword.dto';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto';
import { Response } from 'express';
import { ForgetUsernameDto, SigninDto } from './dto';

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
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    return await this.authService.login(dto, res);
  }

  @ApiOperation({ description: 'Create a new user account' })
  @ApiCreatedResponse({
    description: 'Account created successfully',
    type: SigninDto,
  })
  @ApiForbiddenResponse({ description: 'The email is used' })
  @Post('signup')
  async signup(@Body() dto: CreateUserDto, @Res() res: Response) {
    return await this.authService.signup(dto, res);
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
