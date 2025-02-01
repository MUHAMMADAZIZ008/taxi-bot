import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Users {
  @Prop({ required: false })
  first_name: string;

  @Prop({ required: false })
  last_name: string;

  @Prop({ unique: true, required: false })
  username: string;

  @Prop({ required: false })
  language_code: string;

  @Prop({ unique: true, required: false })
  telegram_id: number;

  @Prop({ required: false })
  chat_language: string;
}

export const UserSchema = SchemaFactory.createForClass(Users);
