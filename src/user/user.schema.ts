import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;
  @Prop({
    required: true,
    unique: true,
  })
  email: string;
  @Prop({ required: true })
  hashPassword: string;
  @Prop()
  age: number;
  // default value and enum values will be added
  @Prop({ enum: [], default: '' })
  suggestedSort: string;
  // moderator access is given to specific users
  @Prop({ enum: ['user', 'admin', 'moderator'], default: 'user' })
  authType: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
