import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';

import { CreateUserDto } from '../user/dto';
import { AuthService } from './auth.service';
import { ForgetUsernameDto, SigninDto } from './dto';
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
    type: SigninDto,
  })
  @ApiUnauthorizedResponse({ description: 'Wrong email or password' })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    return this.authService.login(dto, res);
  }

  @ApiOperation({ description: 'Create a new user account' })
  @ApiCreatedResponse({
    description: 'Account created successfully',
    type: SigninDto,
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

  @UseGuards(JWTForgetPasswordGuard)
  @Post('change-forgotten-password')
  async changeForgottenPassword(
    @Body() dto: ChangeForgottenPasswordDto,
    @Req() req: any,
  ) {
    return this.authService.changePasswordUsingToken(
      req.user._id,
      dto.password,
    );
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
    @Req() req,
  ) {
    return this.authService.changePassword(
      req.user._id,
      changePasswordDto,
      res,
    );
  }
}
