import { IsString, IsUUID, IsNotEmpty, IsEnum } from 'class-validator';
import { UserVerificationCodeUseCaseEnum } from '../user.enum';

export class SendEmailCodeInput {

    @IsString()
    @IsUUID('4')
    @IsNotEmpty()
    user_Id: string;

    @IsString()
    @IsNotEmpty()
    to: string;

    @IsString()
    @IsNotEmpty()
    from: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsEnum(UserVerificationCodeUseCaseEnum)
    @IsNotEmpty()
    useCase: UserVerificationCodeUseCaseEnum;

}