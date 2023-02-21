import { IsNotEmpty , IsEmail} from 'class-validator';

export class VerifyUserByEmailInput {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    verificationCode: string;
}
