import { IsNotEmpty, MinLength, MaxLength, IsEmail } from 'class-validator';

export class ResetPasswordByPhoneInput {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    code: string;

    @MinLength(6)
    @MaxLength(30)
    @IsNotEmpty()
    newPassword: string;
}
