import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { BotCommands } from 'src/command/bot.command';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UserSchema } from 'src/schema/users.schema';
import { ScenesModule } from 'src/scenes/scenes.module';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: '7847029554:AAEya5g3LYNP1hDDo-H1IOspvbEZIOXH3EM',
    }),
    MongooseModule.forFeature([{ name: Users.name, schema: UserSchema }]),
    ScenesModule,
  ],
  providers: [BotService, BotCommands],
})
export class BotModule {}
