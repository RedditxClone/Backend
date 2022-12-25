import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
/**
 * forget user password guard class
 */
@Injectable()
export class JWTForgetPasswordGuard extends AuthGuard('jwt-forget-password') {}
