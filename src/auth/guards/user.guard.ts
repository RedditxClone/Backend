import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
/**
 * logged in user guard class
 */
@Injectable()
export class JWTUserGuard extends AuthGuard('jwt-user') {}
