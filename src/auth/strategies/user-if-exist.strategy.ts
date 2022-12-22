import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// import { Strategy } from 'passport-local';
import type { UserWithId } from '../../user/user.schema';
import { UserService } from '../../user/user.service';

@Injectable()
export class UserIfExistStrategy extends PassportStrategy(
  Strategy,
  'jwt-user-if-exist',
) {
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
  async validate(payload: any): Promise<UserWithId | any> {
    return this.userService.getUserIfExist(payload.id);
  }
}
