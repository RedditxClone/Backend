import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { throwGeneralException } from '../../utils/throwException';
import { UserDocument } from '../../user/user.schema';
import { UserService } from '../../user/user.service';

@Injectable()
export class ForgetPasswordStrategy extends PassportStrategy(
  Strategy,
  'jwt-forget-password',
) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.FORGET_PASSWORD_SECRET,
    });
  }
  /**
   * it's called automatically using a guard super class to validate user using token
   * @param payload object get from jwt token
   * @returns the user
   */
  async validate(payload: any): Promise<UserDocument> {
    const user = await this.userService.getUserByUsername(payload.username);
    return user;
  }
}
