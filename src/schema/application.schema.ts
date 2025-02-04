import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Application {
  @Prop({ required: false })
  full_name: string;

  @Prop({ required: false })
  currnet_address: string;

  @Prop({ required: false })
  phone_number: string;

  @Prop({ required: false })
  where: string;

  @Prop({ required: false })
  departure_time: string;

  @Prop({ required: false })
  message_id: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'users',
    required: true,
  })
  userId: string;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
