import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { UserVerificationCode } from './user-verification-code.model';


export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {

    // @Prop({type: mongoose.Types.ObjectId})
    // id:string;

    @Prop({ required: true })
    firstName: string;

    @Prop()
    lastName: string;

    @Prop()
    fullName?: string;

    @Prop()
    slug: string;

    @Prop()
    notVerifiedEmail?: string;

    @Prop()
    verifiedEmail?: string;

    @Prop()
    phone?: string;

    @Prop()
    token?: string;

    @Prop()
    password: string;

    @Prop()
    country: string;

    @Prop()
    bio: string;

    @Prop({ type: Date })
    birthDate?: Date;

    @Prop()
    device: string;

    @Prop()
    role: string;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserVerificationCode' }] })
    userVerificationCodes?: UserVerificationCode[];
}

export const UserSchema = SchemaFactory.createForClass(User);