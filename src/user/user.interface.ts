import { User } from './models/user.model';
import { UserVerificationCodeUseCaseEnum } from './user.enum';

export interface VerificationCodeAndExpirationDate {
    verificationCode: string;
    expiryDateAfterOneHour: Date;
}

export interface UserByEmailBasedOnUseCaseOrErrorInput {
    email: string;
    useCase: UserVerificationCodeUseCaseEnum;
}

export interface DeleteVerificationCodeAndUpdateUserModelInput {
    user: User;
    useCase: UserVerificationCodeUseCaseEnum;
}

export interface ValidVerificationCodeOrErrorInput {
    user: User;
    verificationCode: string;
    useCase: UserVerificationCodeUseCaseEnum;
}
