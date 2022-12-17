import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Types } from 'mongoose';

import { CreateUserDto, ReturnedUserDto } from '../user/dto';
import { AuthService } from './auth.service';
import { User } from './decorators/user.decorator';
import { ForgetUsernameDto } from './dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangeEmailTypeDto } from './dto/change-email-type.dto';
import {
  ChangeForgottenPasswordDto,
  ChangePasswordDto,
} from './dto/change-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { LoginDto } from './dto/login.dto';
import { JWTUserGuard } from './guards';
import { JWTForgetPasswordGuard } from './guards/forget-password.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ description: 'Login user to his account' })
  @ApiCreatedResponse({
    description: 'Autherized Successfully',
    type: ReturnedUserDto,
  })
  @ApiUnauthorizedResponse({ description: 'Wrong email or password' })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    return this.authService.login(dto, res);
  }

  @ApiOperation({ description: 'Create a new user account' })
  @ApiCreatedResponse({
    description: 'Account created successfully',
    type: ReturnedUserDto,
  })
  @ApiForbiddenResponse({ description: 'The email is used' })
  @Post('signup')
  async signup(@Body() dto: CreateUserDto, @Res() res: Response) {
    return this.authService.signup(dto, res);
  }

  @ApiOperation({ description: 'Recover the password of an account' })
  @ApiCreatedResponse({
    description: 'An email will be sent if the user exists in the database',
  })
  @Post('forget-password')
  async forgetPassword(@Body() dto: ForgetPasswordDto) {
    return this.authService.forgetPassword(dto);
  }

  @ApiOperation({ description: 'Recover the password of an account' })
  @ApiCreatedResponse({
    description: 'An email will be sent if the user exists in the database',
  })
  @ApiUnauthorizedResponse({
    description: "An email couldn't be sent",
  })
  @Post('forget-username')
  async forgetUsername(
    @Body() forgetUsernameDto: ForgetUsernameDto,
    @Res() res: Response,
  ) {
    await this.authService.forgetUsername(forgetUsernameDto, res);
  }

  @ApiProperty({ description: 'after sending token to the user in email' })
  @ApiCreatedResponse({ description: 'password changed successfully' })
  @UseGuards(JWTForgetPasswordGuard)
  @Post('change-forgotten-password')
  async changeForgottenPassword(
    @Body() dto: ChangeForgottenPasswordDto,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.authService.changePasswordUsingToken(userId, dto.password);
  }

  @ApiOperation({ description: 'Change the password of an account' })
  @ApiOkResponse({ description: 'The password changed successfully' })
  @ApiUnauthorizedResponse({ description: 'UnAuthorized' })
  @ApiForbiddenResponse({ description: 'Wrong password' })
  @Patch('change-password')
  @UseGuards(JWTUserGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res: Response,
    @User('_id') userId: Types.ObjectId,
  ) {
    return this.authService.changePassword(userId, changePasswordDto, res);
  }

  @ApiOperation({
    description: 'Create a new user if account is not used or login normally',
  })
  @ApiCreatedResponse({
    description: 'Request processed successfully',
  })
  @ApiForbiddenResponse({ description: 'The token is not valid' })
  @Post('google')
  async continueWithGoogle(@Body('token') token, @Res() res: Response) {
    return this.authService.continueAuth(
      token,
      res,
      'continueWithGoogleAccount',
      this.authService.verfiyUserGmailData,
    );
  }

  @ApiOperation({
    description: 'Create a new user if account is not used or login normally',
  })
  @ApiCreatedResponse({
    description: 'Request processed successfully',
  })
  @ApiForbiddenResponse({ description: 'The token is not valid' })
  @Post('github')
  async continueWithGithub(@Body('token') token, @Res() res) {
    return this.authService.continueAuth(
      token,
      res,
      'continueWithGithubAccount',
      this.authService.verfiyUserGithubData,
    );
  }

  @ApiOperation({
    description: 'change the email of the password',
  })
  @UseGuards(JWTUserGuard)
  @Post('change-email')
  changeEmail(@User('_id') _id, @Body() changeEmailDto: ChangeEmailDto) {
    return this.authService.changeEmail(_id, changeEmailDto);
  }

  @ApiOperation({
    description:
      'Get the first step of change email process weither create password or change the email directly',
  })
  @UseGuards(JWTUserGuard)
  @ApiOkResponse({
    type: ChangeEmailTypeDto,
  })
  @Get('change-email/type')
  getChangeEmailOperation(@User() user) {
    return this.authService.changeMailRequestType(user);
  }

  @ApiOperation({
    description: 'Create a request to create password',
  })
  @UseGuards(JWTUserGuard)
  @Post('create-password-request')
  createPassword(@User() user) {
    return this.authService.createPasswordRequest(user);
  }
}
