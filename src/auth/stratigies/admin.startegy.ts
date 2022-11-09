import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { UserDocument } from '../../user/user.schema';
import { UserService } from '../../user/user.service';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * it's called automatically using a guard super class to validate user using token
   * @param payload object get from jwt token
   * @returns the user
   */
  async validate(payload: any): Promise<UserDocument> {
    const user = await this.userService.getUserById(payload.id);

    if (user.authType !== 'admin') {
      throw new UnauthorizedException(
        'you must be an admin to make this action',
      );
    }

    return user;
  }
}
