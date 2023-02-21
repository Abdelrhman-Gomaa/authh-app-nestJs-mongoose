import { IsEmail, IsNotEmpty, MinLength, MaxLength, IsString, IsOptional, IsEnum } from 'class-validator';
import { DeviceEnum } from '../user.enum';

export class EmailAndPasswordLoginForBoardInput {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(6)
  @MaxLength(30)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  fcmToken?: string;

  @IsEnum(DeviceEnum)
  @IsNotEmpty()
  device: DeviceEnum;
}
