import {
    IsNotEmpty,
    MaxLength,
    IsEmail,
    IsMobilePhone,
    MinLength,
    IsOptional,
    IsString,
    IsLongitude,
    IsLatitude,
    IsEnum,
    IsISO31661Alpha2,
    ValidateIf
} from 'class-validator';
import { DeviceEnum, UserRoleEnum } from '../user.enum';

export class RegisterInput {

    @IsNotEmpty()
    @MaxLength(30)
    firstName: string;

    @IsNotEmpty()
    @MaxLength(30)
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    notVerifiedEmail: string;

    @IsMobilePhone(null, null, { message: 'Invalid Phone Number' })
    @IsNotEmpty()
    phone: string;

    @MinLength(6)
    @MaxLength(30)
    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    birthDate: Date | number;

    @IsOptional()
    @IsString()
    bio?: string;

    @ValidateIf(o => o.lat)
    @IsLongitude()
    long?: number;

    @ValidateIf(o => o.long)
    @IsLatitude()
    lat?: number;

    @IsISO31661Alpha2()
    @IsNotEmpty()
    country: string;

    @IsEnum(DeviceEnum)
    @IsNotEmpty()
    device: DeviceEnum;

    @IsEnum(UserRoleEnum)
    @IsNotEmpty()
    role: UserRoleEnum;

}
