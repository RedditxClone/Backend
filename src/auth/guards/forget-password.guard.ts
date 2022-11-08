import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JWTForgetPasswordGuard extends AuthGuard('jwt-forget-password') {}
