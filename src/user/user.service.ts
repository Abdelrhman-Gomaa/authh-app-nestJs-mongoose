import { UserVerificationCode, UserVerificationCodeDocument } from './models/user-verification-code.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterInput } from './input/register.input';
import { User, UserDocument as UserDocument } from './models/user.model';
import * as bcrypt from 'bcryptjs';
import { generate } from 'voucher-code-generator';
import * as slug from 'speakingurl';
import * as jwt from 'jsonwebtoken';
import { EmailAndPasswordLoginForBoardInput } from './input/email-password-login.input';
import { ResetPasswordByPhoneInput } from './input/reset-password-by-email.nput';
import { SendEmailCodeInput } from './input/send-mail-code.input';
import { DeleteVerificationCodeAndUpdateUserModelInput, UserByEmailBasedOnUseCaseOrErrorInput, ValidVerificationCodeOrErrorInput, VerificationCodeAndExpirationDate } from './user.interface';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { UserVerificationCodeUseCaseEnum } from './user.enum';
import { VerifyUserByEmailInput } from './input/verfied-user-by-email.input';

@Injectable()
export class UserService {

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(User.name) private userVerificationCodeModel: Model<UserVerificationCodeDocument>,
    @InjectQueue('send-mail-code') private readonly mailQueue: Queue
  ) { }

  async register(input: RegisterInput): Promise<User> {

    const errorIfUserWithVerifiedEmailExists = await this.userModel.findOne({ verifiedEmail: input.notVerifiedEmail });
    if (errorIfUserWithVerifiedEmailExists) throw new Error('Email is Already Exists');

    const deleteDuplicatedUsersAtNotVerifiedEmail = await this.userModel.findOne({ notVerifiedEmail: input.notVerifiedEmail });
    if (deleteDuplicatedUsersAtNotVerifiedEmail) await this.userModel.deleteOne({ _id: deleteDuplicatedUsersAtNotVerifiedEmail.id });

    const registerNewUser = new this.userModel({
      ...input,
      fullName: `${input.firstName} ${input.lastName || ''}`.trim(),
      password: await this.hashPassword(input.password),
      slug: this.slugify(`${input.firstName} - ${input.lastName || ''}`),
    });

    await this.sendEmailVerificationCode({
      to: input.notVerifiedEmail,
      from: process.env.MAIL_USER,
      subject: "registration Successfully",
      user_Id: registerNewUser.id,
      useCase: UserVerificationCodeUseCaseEnum.EMAIL_VERIFICATION
    });

    return registerNewUser.save();
  }

  async emailAndPasswordLoginBoard(
    input: EmailAndPasswordLoginForBoardInput
  ) {

    const user = await this.userModel.findOne({ email: input.email });
    if (!user) throw new Error('Email Dose Not Exists');
    // compare password
    await this.matchPassword(input.password, user.password);
    // return token
    return this.appendAuthTokenToUser(user);

  }

  async sendEmailVerificationCode(input: SendEmailCodeInput) {
    const codeAndExpiry = this.generateVerificationCodeAndExpiryDate();
    let txt = `you are Now Register with Us and Your Code Verification is ${codeAndExpiry.verificationCode}`;
    this.mailQueue.add('send-mail-code', {
      ...input,
      text: txt
    }, {
      delay: 10 * 1000
    });

    const newMailCode = new this.userVerificationCodeModel({
      code: codeAndExpiry.verificationCode,
      expiryDate: codeAndExpiry.expiryDateAfterOneHour,
      user: input.user_Id,
      useCase: input.useCase
    });
    await newMailCode.save();

    return true;
  }

  async verifyUserByEmail(input: VerifyUserByEmailInput): Promise<User> {
    const user = await this.userByEmailBasedOnUseCaseOrError({
      email: input.email,
      useCase: UserVerificationCodeUseCaseEnum.EMAIL_VERIFICATION
    });

    this.validVerificationCodeOrError({
      user,
      useCase: UserVerificationCodeUseCaseEnum.EMAIL_VERIFICATION,
      verificationCode: input.verificationCode
    });

    await this.deleteVerificationCodeAndUpdateUserModel(
      { user, useCase: UserVerificationCodeUseCaseEnum.EMAIL_VERIFICATION },
      { verifiedEmail: input.email, notVerifiedEmail: null }
    );

    return this.appendAuthTokenToUser(user);
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  private slugify(value: string): string {
    if (value.charAt(value.length - 1) === '-') value = value.slice(0, value.length - 1);
    return `${slug(value, { titleCase: true })}-${generate({
      charset: '123456789abcdefghgklmnorstuvwxyz',
      length: 4
    })[0]
      }`.toLowerCase();
  }

  private async matchPassword(password: string, hash: string) {
    const isMatched = await bcrypt.compare(password, hash);
    if (!isMatched) throw new Error(' Incorrect Password');
  }

  private generateAuthToken(id: string): string {
    return jwt.sign({ userId: id }, process.env.JWT_SECRET);
  }

  private appendAuthTokenToUser(user: UserDocument) {
    return Object.assign(user, { token: this.generateAuthToken(user.id) });
  }

  private generateVerificationCodeAndExpiryDate(): VerificationCodeAndExpirationDate {
    return {
      verificationCode:
        process.env.NODE_ENV === 'production'
          ? Math.floor(1000 + Math.random() * 9000).toString()
          : '1234',
      expiryDateAfterOneHour: new Date(Date.now() + 3600000)
    };
  }

  async userByNotVerifiedEmailOrError(email: string) {
    const user = await this.userModel.findOne({ notVerifiedEmail: email }, [UserVerificationCode]);
    if (!user) throw new Error('USER_DOES_NOT_EXIST');
    return user;
  }

  async userByVerifiedEmailOrError(email: string) {
    const user = await this.userModel.findOne({ verifiedEmail: email }, [UserVerificationCode]);
    if (!user) throw new Error('USER_DOES_NOT_EXIST');
    return user;
  }

  async userByEmailBasedOnUseCaseOrError(input: UserByEmailBasedOnUseCaseOrErrorInput) {
    return input.useCase === UserVerificationCodeUseCaseEnum.EMAIL_VERIFICATION
      ? await this.userByNotVerifiedEmailOrError(input.email)
      : await this.userByVerifiedEmailOrError(input.email);
  }

  validVerificationCodeOrError(input: ValidVerificationCodeOrErrorInput) {
    const verificationCode = input.user.userVerificationCodes.find(
      obj => obj.code === input.verificationCode && obj.useCase === input.useCase
    );
    if (!verificationCode) throw new Error('VERIFICATION_CODE_NOT_EXIST');
    if (verificationCode.expiryDate < new Date())
      throw new Error('EXPIRED_VERIFICATION_CODE');
  }

  async deleteVerificationCodeAndUpdateUserModel(
    input: DeleteVerificationCodeAndUpdateUserModelInput,
    fieldsWillUpdated: object
  ): Promise<User> {
    await this.userVerificationCodeModel.deleteMany({ userId: input.user, useCase: input.useCase });
    return await this.userModel.findByIdAndUpdate(input.user,
      {
        $set: {
          fieldsWillUpdated
        }
      }
    );
  }

}
