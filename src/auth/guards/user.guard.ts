import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JWTUserGuard extends AuthGuard('jwt-user') {}
