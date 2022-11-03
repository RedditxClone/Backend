<<<<<<< HEAD
import { Module } from '@nestjs/common';

||||||| ceebe63
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
=======
import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
>>>>>>> development
import { AuthController } from './auth.controller';
<<<<<<< HEAD
import { AuthService } from './auth.service';

||||||| ceebe63

=======
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/user/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
@Global()
>>>>>>> development
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
