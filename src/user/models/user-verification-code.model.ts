import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { UserVerificationCodeUseCaseEnum } from '../user.enum';
import { User } from './user.model';


export type UserVerificationCodeDocument = HydratedDocument<UserVerificationCode>

@Schema()
export class UserVerificationCode{

    @Prop({required: true})
    useCase: UserVerificationCodeUseCaseEnum;

    @Prop()
    code: string;
    
    @Prop({type: Date})
    expiryDate: Date;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
    user: User;

}

export const UserVerificationCodeSchema = SchemaFactory.createForClass(UserVerificationCode)