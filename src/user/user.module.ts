import { UserVerificationCode, UserVerificationCodeSchema } from './models/user-verification-code.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './models/user.model';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: User.name, schema: UserSchema },
        { name: UserVerificationCode.name, schema: UserVerificationCodeSchema }
      ]
      ),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
